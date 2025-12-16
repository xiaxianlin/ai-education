import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Space, Modal } from 'antd';
import { usePromptVersionListModel } from '../models/page';
import { CommonTable } from '@/components/business';
import { adminApi } from '@/lib/api';
import { createTimeColumn, createActionColumn } from '@/hooks';

export default function MainView() {
  const navigate = useNavigate();
  const { actionRef, promptId, handlePublish } = usePromptVersionListModel();

  const columns = useMemo<ProColumns<PromptVersion>[]>(
    () => [
      { title: '版本 ID', dataIndex: 'id', width: 100 },
      {
        title: '状态',
        dataIndex: 'is_published',
        width: 100,
        render: (isPublished: number) => (
          <Tag color={isPublished === 1 ? 'green' : 'default'}>
            {isPublished === 1 ? '已发布' : '未发布'}
          </Tag>
        ),
      },
      {
        title: '模板内容',
        dataIndex: 'template_content',
        ellipsis: true,
        width: 300,
        render: (text: string) => (
          <span style={{ maxWidth: 300, display: 'inline-block' }}>{text?.substring(0, 100)}...</span>
        ),
      },
      createTimeColumn<PromptVersion>('创建时间', 'create_time'),
      createTimeColumn<PromptVersion>('更新时间', 'update_time'),
      createActionColumn<PromptVersion>(
        (_, record) => (
          <Space>
            <Button
              size="small"
              type="link"
              onClick={() => navigate(`/prompt/detail/${record.id}`)}
            >
              详情
            </Button>
            {record.is_published === 0 && (
              <Button
                size="small"
                type="link"
                onClick={() => handlePublish(record.id)}
              >
                发布
              </Button>
            )}
            <Button
              size="small"
              type="link"
              onClick={() => navigate(`/prompt/test/${record.id}`)}
            >
              测试
            </Button>
          </Space>
        ),
        { width: 200 },
      ),
    ],
    [navigate, handlePublish],
  );

  return (
    <PageContainer title="提示词版本列表" header={{ breadcrumb: {} }}>
      <CommonTable<PromptVersion>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultColsNumber: 6,
        }}
        request={async ({ pageSize, current }) => {
          const data = await adminApi.listPromptVersions({
            prompt_id: promptId,
            page: current || 1,
            size: pageSize || 10,
          });
          return {
            data: data.data || [],
            success: true,
            total: data.total || 0,
          };
        }}
      />
    </PageContainer>
  );
}


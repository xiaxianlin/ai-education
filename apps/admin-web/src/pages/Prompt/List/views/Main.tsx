import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePromptListModel } from '../models/page';
import { CommonTable } from '@/components/business';
import { adminApi } from '@/lib/api';
import { createTimeColumn, createActionColumn } from '@/hooks';

export default function MainView() {
  const navigate = useNavigate();
  const { actionRef } = usePromptListModel();

  const columns = useMemo<ProColumns<Prompt>[]>(
    () => [
      { title: '名称', dataIndex: 'name', width: 200 },
      { title: 'Slug', dataIndex: 'slug', width: 150 },
      { title: '类型', dataIndex: 'type', width: 150 },
      {
        title: '状态',
        dataIndex: ['version', 'is_published'],
        width: 100,
        renderText: (isPublished: number) => (
          <Tag color={isPublished === 1 ? 'green' : 'default'}>{isPublished === 1 ? '已发布' : '未发布'}</Tag>
        ),
      },
      createTimeColumn<Prompt>('创建时间', 'version.create_time', { width: 180 }),
      createActionColumn<Prompt>(
        (_, record) => (
          <Space>
            <Button
              size="small"
              type="link"
              onClick={() => {
                // 如果有版本信息，跳转到详情页（使用 version_id）
                const versionId = record.version?.id;
                if (versionId) {
                  navigate(`/prompt/detail/${versionId}`);
                } else {
                  // 如果没有版本，跳转到版本列表
                  navigate(`/prompt/versions?prompt_id=${record.id}`);
                }
              }}
            >
              详情
            </Button>
            <Button size="small" type="link" onClick={() => navigate(`/prompt/versions?prompt_id=${record.id}`)}>
              版本列表
            </Button>
          </Space>
        ),
        { width: 150 },
      ),
    ],
    [navigate],
  );

  return (
    <PageContainer title="提示词管理" header={{ breadcrumb: {} }}>
      <CommonTable<Prompt>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultColsNumber: 6,
        }}
        headerTitle={
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/prompt/form')}>
            新建提示词
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await adminApi.listPrompts({
            page: current || 1,
            size: pageSize || 10,
            name: filter.name,
            type: filter.type,
            slug: filter.slug,
          });
          return {
            data: data?.data || [],
            success: true,
            total: data?.total || 0,
          };
        }}
      />
    </PageContainer>
  );
}

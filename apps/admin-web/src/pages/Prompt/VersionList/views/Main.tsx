import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, Typography, Flex } from 'antd';
import { usePromptVersionListModel } from '../models/page';
import { CommonTable, PageHeader } from '@/components';
import { adminApi } from '@/lib/api';
import { createTimeColumn, createActionColumn } from '@/hooks';
import { PublishModal } from '../../Detail/components/PublishModal';

export default function MainView() {
  const navigate = useNavigate();
  const { actionRef, promptId, handlePublish } = usePromptVersionListModel();

  const columns = useMemo<ProColumns<PromptVersion>[]>(
    () => [
      {
        title: '版本 ID',
        dataIndex: 'id',
        width: 100,
        renderText: (id: number) => (
          <Button size="small" type="link" onClick={() => navigate(`/prompt/detail?version_id=${id}`)}>
            {id}
          </Button>
        ),
      },
      {
        title: '状态',
        dataIndex: 'is_published',
        width: 100,
        renderText: (isPublished: number) => (
          <Tag color={isPublished === 1 ? 'green' : 'default'}>{isPublished === 1 ? '已发布' : '未发布'}</Tag>
        ),
      },
      {
        title: '模板内容',
        dataIndex: 'template_content',
        ellipsis: true,
        renderText: (template_content: string) => (
          <Typography.Text ellipsis={{ tooltip: template_content }} style={{ maxWidth: 300 }}>
            {template_content}
          </Typography.Text>
        ),
      },
      {
        title: '变更说明',
        dataIndex: 'changelog',
        renderText: (changelog: string) => (
          <Typography.Text ellipsis={{ tooltip: changelog }} style={{ maxWidth: 300 }}>
            {changelog || '-'}
          </Typography.Text>
        ),
      },
      createTimeColumn<PromptVersion>('创建时间', 'create_time'),
      createTimeColumn<PromptVersion>('更新时间', 'update_time'),
      createActionColumn<PromptVersion>(
        (_, record) => (
          <Flex gap={8}>
            {record.is_published === 0 && (
              <>
                <PublishModal
                  size="small"
                  buttonType="link"
                  versionId={record.id}
                  onSuccess={actionRef.current?.reload}
                />
                <Button size="small" type="link" onClick={() => navigate(`/prompt/form?version_id=${record.id}`)}>
                  编辑
                </Button>
              </>
            )}
            <Button size="small" type="link" onClick={() => navigate(`/prompt/test?version_id=${record.id}`)}>
              测试
            </Button>
          </Flex>
        ),
        { width: 180 },
      ),
    ],
    [navigate, handlePublish],
  );

  return (
    <PageContainer
      title={<PageHeader title="提示词版本列表" />}
      
      header={{ breadcrumb: {} }}
    >
      <CommonTable<PromptVersion>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={false}
        request={async ({ pageSize, current }) => {
          const data = await adminApi.listPromptVersions({
            prompt_id: promptId,
            page: current || 1,
            size: pageSize || 10,
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

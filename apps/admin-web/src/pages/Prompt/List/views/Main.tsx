import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tag, Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePromptListModel } from '../models/page';
import { DeleteButton, StatusTag } from '@/components';
import { adminApi } from '@/lib/api';
import { createTimeColumn, createActionColumn, createStatusColumn } from '@/hooks';

export default function MainView() {
  const navigate = useNavigate();
  const { actionRef, handleDelete } = usePromptListModel();

  const columns = useMemo<ProColumns<Prompt>[]>(
    () => [
      {
        title: '当前版本ID',
        dataIndex: 'current_version_id',
        hideInSearch: true,
        width: 120,
        renderText: (currentVersionId: number) => (
          <Button size="small" type="link" onClick={() => navigate(`/prompt/detail?version_id=${currentVersionId}`)}>
            {currentVersionId}
          </Button>
        ),
      },
      { title: '名称', dataIndex: 'name', width: 120 },
      { title: '标识', dataIndex: 'slug', width: 120 },
      { title: '类型', dataIndex: 'type', width: 120, valueEnum: { system: '系统提示词', user: '用户提示词' } },
      createStatusColumn<Prompt>('状态', ['version', 'is_published'], {
        width: 100,
        render: (val) => <StatusTag status={val === 1} trueText="已发布" falseText="未发布" />,
      }),
      { title: '描述', dataIndex: 'description', width: 200, hideInSearch: true },
      createTimeColumn<Prompt>('创建时间', ['version', 'create_time'], { width: 180 }),
      createActionColumn<Prompt>(
        (record) => (
          <>
            <Button type="link" onClick={() => navigate(`/prompt/test?version_id=${record.version?.id}`)}>
              测试
            </Button>
            <Button type="link" onClick={() => navigate(`/prompt/form?version_id=${record.version?.id}`)}>
              编辑
            </Button>
            <DeleteButton onConfirm={() => handleDelete(record.id)} />
            <Button type="link" onClick={() => navigate(`/prompt/versions?prompt_id=${record.id}`)}>
              版本列表
            </Button>
          </>
        ),
        { width: 150 },
      ),
    ],
    [navigate],
  );

  return (
    <PageContainer title="提示词管理" header={{ breadcrumb: {} }}>
      <ProTable<Prompt>
        bordered
        cardBordered
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultCollapsed: true,
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

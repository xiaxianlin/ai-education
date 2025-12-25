import { DeleteButton } from '@/components';
import { createActionColumn, createTimeColumn } from '@/hooks';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Typography } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PromptApi } from '../../api';
import { usePromptListModel } from '../models/page';

export default function MainView() {
  const navigate = useNavigate();
  const { actionRef, handleDelete } = usePromptListModel();

  const columns = useMemo<ProColumns<Prompt>[]>(
    () => [
      { title: 'ID', dataIndex: 'id', width: 80, hideInSearch: true },
      { title: '名称', dataIndex: 'name', width: 120 },
      { title: '标识', dataIndex: 'slug', width: 120 },
      { title: '类型', dataIndex: 'type', width: 120, valueEnum: { system: '系统提示词', user: '用户提示词' } },
      {
        title: '模板内容',
        dataIndex: 'template_content',
        hideInSearch: true,
        width: 300,
        render: (_, record) => (
          <Typography.Text ellipsis={{ tooltip: record.template_content }} style={{ maxWidth: 280 }}>
            {record.template_content}
          </Typography.Text>
        ),
      },
      { title: '描述', dataIndex: 'description', width: 200, hideInSearch: true },
      createTimeColumn<Prompt>('创建时间', 'create_time', { width: 180 }),
      createActionColumn<Prompt>(
        (record) => (
          <>
            <Button type="link" onClick={() => navigate(`/prompt/test?id=${record.id}`)}>
              测试
            </Button>
            <Button type="link" onClick={() => navigate(`/prompt/form?id=${record.id}`)}>
              编辑
            </Button>
            <DeleteButton onConfirm={() => handleDelete(record.id)} />
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
          const data = await PromptApi.listPrompts({
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

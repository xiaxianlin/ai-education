import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminApi } from '@/lib/api';
import { CommonTable } from '@/components/business';

export default function PromptListPage() {
  const navigate = useNavigate();

  const columns = useMemo<ProColumns<Prompt>[]>(
    () => [
      { title: '名称', dataIndex: 'name' },
      { title: 'Slug', dataIndex: 'slug' },
      { title: '分类', dataIndex: 'category' },
      {
        title: '状态',
        dataIndex: 'status',
        render: (_, record) => <Tag color={record.status === 'published' ? 'green' : 'blue'}>{record.status}</Tag>,
      },
      {
        title: '当前版本',
        dataIndex: 'current_version_id',
        render: (_, record) => record.current_version?.version_no ?? '-',
      },
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) => (
          <Button type="link" size="small" onClick={() => navigate(`/prompt/detail/${record.id}`)}>
            查看
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <PageContainer title="提示词管理">
      <CommonTable<Prompt>
        rowKey="id"
        search={{ labelWidth: 80 }}
        columns={columns}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => navigate('/prompt/form/new')}>
            新建提示词
          </Button>,
        ]}
        request={async (params) => {
          const data = await adminApi.listPrompts({
            keyword: params.keyword,
            category: params.category,
            status: params.status,
          });
          return { data, success: true };
        }}
      />
    </PageContainer>
  );
}

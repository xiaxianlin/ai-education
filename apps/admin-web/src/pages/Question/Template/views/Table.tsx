import { DeleteButton } from '@/components';
import { createActionColumn, createTimeColumn } from '@/hooks/useTableColumns';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { useMemo } from 'react';
import { useQuestionTemplateModel } from '../models/page';

export default function TableView() {
  const { data, loading, questionTypes, showForm, handleDelete } = useQuestionTemplateModel();

  const columns = useMemo<ProColumns<QuestionTemplate>[]>(
    () => [
      {
        title: '模板名称',
        dataIndex: 'name',
        width: 200,
      },
      {
        title: '所属题型',
        dataIndex: 'questionTypeId',
        width: 150,
        render: (_, record) =>
          questionTypes?.find((t) => t.id === record.questionTypeId)?.name || record.questionTypeId,
      },
      {
        title: '状态',
        dataIndex: 'isActive',
        width: 100,
        render: (_, record) => (record.isActive ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>),
      },
      createTimeColumn('创建时间', 'createTime'),
      createActionColumn<QuestionTemplate>(
        (record) => (
          <>
            <Button key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
            <DeleteButton buttonProps={{ type: 'link' }} onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 150 },
      ),
    ],
    [questionTypes, showForm, handleDelete],
  );

  return (
    <ProTable<QuestionTemplate>
      bordered
      rowKey="id"
      search={false}
      loading={loading}
      columns={columns}
      dataSource={data}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        defaultPageSize: 20,
      }}
    />
  );
}

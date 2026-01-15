import { DeleteButton } from '@/components';
import { createActionColumn } from '@/hooks';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { QuestionApi } from '../../api';
import { useQuestionListModel } from '../models/page';

export function ListView() {
  const { actionRef, subject, grade, showForm, showDetail, handleDelete } = useQuestionListModel();

  const columns: ProColumns<Question>[] = [
    {
      title: '题目ID',
      dataIndex: 'id',
      width: 200,
      copyable: true,
      hideInTable: true,
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      hideInTable: true,
    },
    {
      title: '内容',
      ellipsis: true,
      dataIndex: ['content', 'stem'],
      width: 300,
    },
    {
      title: '题型名称',
      dataIndex: ['question_type', 'name'],
      width: 150,
    },
    createActionColumn<Question>(
      (record) => (
        <>
          <Button key="detail" type="link" onClick={() => showDetail(record)}>
            详情
          </Button>
          <Button key="edit" type="link" onClick={() => showForm(record)}>
            编辑
          </Button>
          <DeleteButton
            key="delete"
            title="确定要删除这道题目吗？"
            onConfirm={() => handleDelete(record.id)}
            buttonProps={{ type: 'link' }}
          />
        </>
      ),
      { width: 180 },
    ),
  ];

  return (
    <ProTable<Question>
      actionRef={actionRef}
      bordered
      cardBordered
      rowKey="id"
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
      }}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      scroll={{ x: 'max-content' }}
      request={async ({ current, pageSize, id, name }) => {
        const res = await QuestionApi.searchQuestions({ page: current, size: pageSize, subject, grade, id, name });
        return { data: res?.data || [], total: res?.total || 0, success: true };
      }}
    />
  );
}

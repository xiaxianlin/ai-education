import { DeleteButton } from '@/components';
import { createActionColumn } from '@/hooks/useTableColumns';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { QuestionApi } from '../../api';
import { useQuestionTypeModel } from '../models/page';

export default function UnitPracticeListView() {
  const { unitActionRef, showForm, handleDelete } = useQuestionTypeModel();

  const columns = useMemo<ProColumns<QuestionType>[]>(
    () => [
      {
        title: '名称',
        dataIndex: 'name',
        width: 150,
      },
      {
        title: '编码',
        dataIndex: 'code',
        width: 150,
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: 500,
        render: (text) => text || '-',
      },
      createActionColumn<QuestionType>(
        (record) => (
          <>
            <Button key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
            <Link key="settings" to={`/question_type/settings/prompt/${record.code}`}>
              <Button type="link">指令</Button>
            </Link>
            <Link key="generate" to={`/question/generate/${record.code}`}>
              <Button type="link">生成</Button>
            </Link>
            <DeleteButton buttonProps={{ type: 'link' }} onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 180 },
      ),
    ],
    [showForm, handleDelete],
  );

  return (
    <ProTable<QuestionType>
      bordered
      rowKey="id"
      search={false}
      columns={columns}
      actionRef={unitActionRef}
      scroll={{ x: 'max-content' }}
      headerTitle={
        <Button type="primary" size="large" onClick={() => showForm()} icon={<PlusOutlined />}>
          新增题型
        </Button>
      }
      request={async () => ({ data: await QuestionApi.searchUnitPracticeTypes(), success: true })}
    />
  );
}

import { DeleteButton, SubjectGradeTabs } from '@/components';
import { createActionColumn } from '@/hooks/useTableColumns';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useMemo } from 'react';
import { QuestionApi } from '../../api';
import { useQuestionTypeModel } from '../models/page';

export default function AbilityPracticeListView() {
  const { abilityActionRef, subject, grade, showForm, handleDelete } = useQuestionTypeModel();

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
        title: '能力',
        dataIndex: ['ability', 'name'],
        width: 150,
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: 200,
        render: (text) => text || '-',
      },
      {
        title: '配置',
        dataIndex: 'configs',
        width: 150,
        render: (text) => JSON.stringify(text) || '-',
      },
      createActionColumn<QuestionType>(
        (record) => (
          <>
            <Button key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
            <DeleteButton buttonProps={{ type: 'link' }} onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 120 },
      ),
    ],
    [showForm, handleDelete],
  );

  return (
    <>
      <SubjectGradeTabs />
      <ProTable<QuestionType>
        bordered
        rowKey="id"
        search={false}
        columns={columns}
        actionRef={abilityActionRef}
        scroll={{ x: 'max-content' }}
        pagination={{
          defaultPageSize: 20,
        }}
        headerTitle={
          <Button type="primary" size="large" onClick={() => showForm()} icon={<PlusOutlined />}>
            新增题型
          </Button>
        }
        request={async () => {
          const data = await QuestionApi.searchAbilityPracticeTypes({ subject, grade });
          return { data, success: true };
        }}
      />
    </>
  );
}

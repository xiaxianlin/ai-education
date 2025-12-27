import { DeleteButton } from '@/components';
import { createActionColumn, createTimeColumn } from '@/hooks/useTableColumns';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Select, Tag } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionTemplateModel } from '../models/page';
import { QuestionApi } from '../../api';

export default function ListView() {
  const navigate = useNavigate();
  const { actionRef, questionTypesOptions, handleDelete, questionTypeId, setQuestionTypeId } =
    useQuestionTemplateModel();

  const columns = useMemo<ProColumns<QuestionTemplate>[]>(
    () => [
      {
        title: '模板名称',
        dataIndex: 'name',
        width: 200,
        render: (text, record) => <a onClick={() => navigate(`/question_template/detail/${record.id}`)}>{text}</a>,
      },
      {
        title: '所属题型',
        dataIndex: 'question_type_id',
        width: 150,
        render: (_, record) => record.question_type?.name || record.question_type_id,
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        width: 100,
        render: (_, record) => (record.is_active ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>),
      },
      createTimeColumn('创建时间', 'create_time'),
      createActionColumn<QuestionTemplate>(
        (record) => (
          <>
            <Button key="detail" type="link" onClick={() => navigate(`/question_template/detail/${record.id}`)}>
              详情
            </Button>
            <Button key="edit" type="link" onClick={() => navigate(`/question_template/form/${record.id}`)}>
              编辑
            </Button>
            <DeleteButton buttonProps={{ type: 'link' }} onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 120 },
      ),
    ],
    [navigate, handleDelete],
  );

  return (
    <ProTable<QuestionTemplate>
      bordered
      rowKey="id"
      search={false}
      columns={columns}
      actionRef={actionRef}
      pagination={{
        defaultPageSize: 20,
      }}
      toolBarRender={() => [
        <Select
          allowClear
          placeholder="按题型筛选"
          style={{ width: 200 }}
          value={questionTypeId}
          onChange={setQuestionTypeId}
          options={questionTypesOptions}
        />,
      ]}
      headerTitle={
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/question_template/form')}>
          新增模板
        </Button>
      }
      request={async ({ current, pageSize }) => {
        const res = await QuestionApi.listQuestionTemplates({
          question_type_id: questionTypeId,
          page: current,
          size: pageSize,
        });
        return {
          data: res?.data || [],
          total: res?.total || 0,
          success: true,
        };
      }}
    />
  );
}

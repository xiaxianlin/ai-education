import { DeleteButton } from '@/components';
import { createActionColumn } from '@/hooks/useTableColumns';
import {
  ANSWER_TYPE_LABELS,
  GRADES,
  INTERACTION_TYPE_LABELS,
  RESOURCE_TYPE_LABELS,
  Stage,
  STAGE_LABELS as STAGE_LABEL_MAP,
} from '@ai-education/shared-web';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionTypeModel } from '../models/page';
import { QuestionApi } from '../../api';

export default function ListView() {
  const navigate = useNavigate();
  const { actionRef, subject, grade, handleDelete } = useQuestionTypeModel();

  const columns = useMemo<ProColumns<QuestionType>[]>(
    () => [
      {
        title: '编码',
        dataIndex: 'code',
        width: 150,
        ellipsis: true,
        copyable: true,
      },
      {
        title: '名称',
        dataIndex: 'name',
        width: 200,
        render: (text, record) => <a onClick={() => navigate(`/question_type/detail/${record.id}`)}>{text}</a>,
      },
      {
        title: '科目',
        dataIndex: 'subject',
        width: 80,
        render: (_, record) => <Tag color="blue">{record.subject}</Tag>,
      },
      {
        title: '学段',
        dataIndex: 'stages',
        width: 150,
        render: (_, record) => (
          <Space size={4} wrap>
            {record.stages.map((s: Stage) => (
              <Tag key={s} color="green">
                {STAGE_LABEL_MAP[s as keyof typeof STAGE_LABEL_MAP] || s}
              </Tag>
            ))}
          </Space>
        ),
      },
      {
        title: '年级',
        dataIndex: 'grades',
        width: 120,
        render: (_, record) => record.grades.map((grade) => GRADES[grade]).join(', '),
      },
      {
        title: '交互类型',
        dataIndex: 'interaction_type',
        width: 100,
        render: (_, record) => (
          <Tag color="purple">
            {INTERACTION_TYPE_LABELS[record.interaction_type as keyof typeof INTERACTION_TYPE_LABELS] ||
              record.interaction_type}
          </Tag>
        ),
      },
      {
        title: '资源类型',
        dataIndex: 'resource_type',
        width: 80,
        render: (_, record) => (
          <Tag>
            {RESOURCE_TYPE_LABELS[record.resource_type as keyof typeof RESOURCE_TYPE_LABELS] || record.resource_type}
          </Tag>
        ),
      },
      {
        title: '答案类型',
        dataIndex: 'answer_type',
        width: 100,
        render: (_, record) => (
          <Tag color="orange">
            {ANSWER_TYPE_LABELS[record.answer_type as keyof typeof ANSWER_TYPE_LABELS] || record.answer_type}
          </Tag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        width: 80,
        render: (_, record) => (record.is_active ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>),
      },
      createActionColumn<QuestionType>(
        (record) => (
          <>
            <Button key="detail" type="link" onClick={() => navigate(`/question_type/detail/${record.id}`)}>
              详情
            </Button>
            <Button key="edit" type="link" onClick={() => navigate(`/question_type/form/${record.id}`)}>
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
    <ProTable<QuestionType>
      bordered
      rowKey="id"
      search={false}
      columns={columns}
      actionRef={actionRef}
      pagination={{
        defaultPageSize: 20,
      }}
      headerTitle={
        <Button type="primary" size="large" onClick={() => navigate('/question_type/form')} icon={<PlusOutlined />}>
          新增题型
        </Button>
      }
      request={async ({ current, pageSize }) => {
        const res = await QuestionApi.searchQuestionTypes({
          page: current,
          size: pageSize,
          subject,
          grade,
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

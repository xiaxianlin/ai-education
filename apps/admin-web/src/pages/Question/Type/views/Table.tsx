import { DeleteButton } from '@/components';
import { createActionColumn } from '@/hooks/useTableColumns';
import {
  ANSWER_TYPE_LABELS,
  INTERACTION_TYPE_LABELS,
  RESOURCE_TYPE_LABELS,
  STAGE_LABELS,
} from '@ai-education/shared-web';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Flex, Space, Tag } from 'antd';
import { useMemo } from 'react';
import { useQuestionTypeModel } from '../models/page';

export default function TableView() {
  const { data, loading, refresh, showForm, handleDelete } = useQuestionTypeModel();

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
                {STAGE_LABELS[s as keyof typeof STAGE_LABELS] || s}
              </Tag>
            ))}
          </Space>
        ),
      },
      {
        title: '年级',
        dataIndex: 'grades',
        width: 120,
        render: (_, record) => record.grades.join(', '),
      },
      {
        title: '交互类型',
        dataIndex: 'interactionType',
        width: 100,
        render: (_, record) => (
          <Tag color="purple">
            {INTERACTION_TYPE_LABELS[record.interactionType as keyof typeof INTERACTION_TYPE_LABELS] ||
              record.interactionType}
          </Tag>
        ),
      },
      {
        title: '资源类型',
        dataIndex: 'resourceType',
        width: 80,
        render: (_, record) => (
          <Tag>
            {RESOURCE_TYPE_LABELS[record.resourceType as keyof typeof RESOURCE_TYPE_LABELS] || record.resourceType}
          </Tag>
        ),
      },
      {
        title: '答案类型',
        dataIndex: 'answerType',
        width: 100,
        render: (_, record) => (
          <Tag color="orange">
            {ANSWER_TYPE_LABELS[record.answerType as keyof typeof ANSWER_TYPE_LABELS] || record.answerType}
          </Tag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'isActive',
        width: 80,
        render: (_, record) => (record.isActive ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>),
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
        { width: 150 },
      ),
    ],
    [showForm, handleDelete],
  );

  return (
    <ProTable<QuestionType>
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
      headerTitle={
        <Flex gap={8}>
          <Button type="primary" size="large" onClick={() => showForm()} icon={<PlusOutlined />}>
            新增题型
          </Button>
          <Button size="large" onClick={refresh} icon={<ReloadOutlined />}>
            刷新
          </Button>
        </Flex>
      }
    />
  );
}

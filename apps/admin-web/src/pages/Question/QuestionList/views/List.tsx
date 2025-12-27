import { DeleteButton } from '@/components';
import { createActionColumn } from '@/hooks';
import { DIFFICULTY_LABELS, INTERACTION_TYPE_LABELS, isCompositeQuestion } from '@ai-education/shared-web';
import { EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionApi } from '../../api';
import { useQuestionListModel } from '../models/page';

export function ListView() {
  const navigate = useNavigate();
  const { actionRef, subject, grade, handleDelete, handlePreview } = useQuestionListModel();

  const columns: ProColumns<Question>[] = [
    {
      title: '题干',
      dataIndex: ['stem', 'text'],
      ellipsis: true,
      width: 300,
    },
    {
      title: '题型',
      dataIndex: 'question_type_code',
      width: 120,
      render: (_, record) => (
        <Tag color="purple">
          {INTERACTION_TYPE_LABELS[record.question_type_code as keyof typeof INTERACTION_TYPE_LABELS] ||
            record.question_type_code}
        </Tag>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 80,
      render: (_, record) => (
        <Tag color={record.difficulty === 'easy' ? 'green' : record.difficulty === 'medium' ? 'orange' : 'red'}>
          {DIFFICULTY_LABELS[record.difficulty as Difficulty]}
        </Tag>
      ),
    },
    {
      title: '类型',
      width: 80,
      render: (_, record) => (isCompositeQuestion(record) ? <Tag color="volcano">复合题</Tag> : <Tag>单题</Tag>),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      width: 80,
      sorter: true,
    },
    {
      title: '正确率',
      dataIndex: 'correctRate',
      width: 80,
      render: (rate) => (rate ? `${rate}%` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: 80,
      render: (_, record) => (record.is_active ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>),
    },
    createActionColumn<Question>(
      (record) => (
        <>
          <Button key="preview" type="link" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button key="detail" type="link" onClick={() => navigate(`/question/detail/${record.id}`)}>
            详情
          </Button>
          <Button key="edit" type="link" onClick={() => navigate(`/question/form/${record.id}`)}>
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

  useEffect(() => {
    actionRef.current?.reload?.(true);
  }, [subject, grade, actionRef]);

  return (
    <ProTable<Question>
      actionRef={actionRef}
      bordered
      cardBordered
      rowKey="id"
      search={false}
      columns={columns}
      pagination={{ defaultPageSize: 20 }}
      scroll={{ x: 'max-content' }}
      request={async ({ current, pageSize }) => {
        const res = await QuestionApi.searchQuestions({
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
      headerTitle={
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/question/form')}>
          新建题目
        </Button>
      }
    />
  );
}

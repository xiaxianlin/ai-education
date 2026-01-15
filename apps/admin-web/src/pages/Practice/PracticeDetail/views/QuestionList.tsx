import { createActionColumn } from '@/hooks';
import {
  formatCorrectAnswer,
  formatExplanation,
  hasAnswer,
  renderResourceStatus,
  showAnswerModal,
} from '@/utils/question';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Card, Space, Tag, Typography } from 'antd';
import { useMemo } from 'react';
import { formatDuration } from '../../PracticeList/utils';
import { usePracticeDetailModel } from '../models/page';

export function QuestionList() {
  const { session, questions, answersMap, navigate, handleViewQuestion, handleResetAnswer } = usePracticeDetailModel();

  const columns = useMemo<ProColumns<Question>[]>(
    () => [
      {
        title: '序号',
        dataIndex: 'index',
        width: 60,
        render: (_, __, index) => index + 1,
      },
      {
        title: '题型',
        dataIndex: 'question_type_code',
        width: 120,
        render: (_: any, record: Question) => record.question_type?.name || record.question_type_code,
      },
      {
        title: '题目内容',
        maxWidth: 300,
        render: (_: any, record: Question) => {
          const content = record.content || {};
          const stem = content.stem || '';
          const stemText = typeof stem === 'string' ? stem : (stem as Stem)?.text || '';
          return (
            <Typography.Text ellipsis style={{ maxWidth: '500px' }}>
              {stemText}
            </Typography.Text>
          );
        },
      },
      // TODO: difficulty 字段已删除
      {
        title: '素材',
        width: 100,
        render: (_, record) => renderResourceStatus(record),
      },
      {
        title: '是否作答',
        dataIndex: 'id',
        width: 100,
        render: (questionId: any, record: Question) => {
          const answer = answersMap[questionId];
          const answerExists = hasAnswer(answer);

          const handleViewAnswer = () => {
            const questionAnswer = record.answer;
            const studentAnswer = answer?.text_answer || '未作答';
            const correctAnswer = answer?.correct_answer || questionAnswer?.correct_answers;

            const correctAnswerText = formatCorrectAnswer(correctAnswer, questionAnswer);
            const explanationText = formatExplanation(answer?.analysis, record.explanation);

            showAnswerModal({
              studentAnswer,
              correctAnswer: correctAnswerText,
              explanation: explanationText,
            });
          };

          if (answerExists) {
            return (
              <Tag
                color="success"
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewAnswer();
                }}
              >
                已作答
              </Tag>
            );
          }
          return <Tag color="default">未作答</Tag>;
        },
      },
      {
        title: '答题结果',
        dataIndex: 'id',
        width: 100,
        render: (questionId: any) => {
          const answer = answersMap[questionId];
          if (!answer || answer.status === 0) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          const isCorrect = answer.status === 1;
          return <Tag color={isCorrect ? 'success' : 'error'}>{isCorrect ? '正确' : '错误'}</Tag>;
        },
      },
      {
        title: '答题耗时',
        dataIndex: 'id',
        width: 100,
        render: (questionId: any) => {
          const answer = answersMap[questionId];
          if (!answer || !answer.time_spent) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          return formatDuration(answer.time_spent);
        },
      },
      createActionColumn<Question>(
        (record) => {
          const answer = answersMap[record.id];
          const answerExists = hasAnswer(answer);

          return (
            <Space>
              <Button
                type="link"
                size="small"
                style={{ padding: 0 }}
                onClick={() => navigate(`/question/detail/${record.id}`)}
              >
                详情
              </Button>
              <Button type="link" size="small" onClick={() => handleViewQuestion(record)}>
                预览
              </Button>
              <Button
                type="link"
                size="small"
                danger
                disabled={!answerExists}
                onClick={() => handleResetAnswer(record.id)}
              >
                重置
              </Button>
            </Space>
          );
        },
        { width: 150 },
      ),
    ],
    [answersMap, handleViewQuestion, handleResetAnswer, navigate],
  );

  if (!session) {
    return null;
  }

  return (
    <Card title={`题目列表（共 ${session.question_count} 题）`} className="simple-table-card">
      <ProTable<Question>
        rowKey="id"
        columns={columns}
        search={false}
        pagination={false}
        dataSource={questions}
        loading={false}
        options={false}
        toolbar={{ actions: [] }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
}

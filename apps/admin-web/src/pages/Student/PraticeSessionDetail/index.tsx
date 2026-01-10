import { PRACTICE_STATUS_COLORS, PRACTICE_STATUS_LABELS } from '@/constants/practice';
import { createActionColumn } from '@/hooks';
import { StudentApi } from '../api';
import { formatDateTime } from '@ai-education/shared-web';
import { PageContainer, ProColumns, ProDescriptions, ProSkeleton, ProTable } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Button, Card, Col, Empty, Row, Space, Statistic, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QuestionDetailDrawer } from './views/QuestionDetailDrawer';

const PRACTICE_SLUG_LABELS: Record<string, string> = {
  daily_practice: '日常练习',
  unit_practice: '单元练习',
  assess_practice: '综合评估',
};

export default function PracticeDetailPage() {
  const { id, session_id } = useParams<{ id: string; session_id: string }>();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<Question>();
  // 使用学生练习会话详情接口
  const { data, loading, error } = useRequest(() => StudentApi.getStudentPracticeSessionData(id || '', Number(session_id)), {
    ready: !!id && !!session_id,
  });

  const { session, answers = [], questions = [] } = (data as any) || {};

  const answersMap = useMemo(() => {
    return answers.reduce(
      (acc: { [x: string]: PracticeAnswer }, answer: PracticeAnswer) => {
        acc[answer.question_id] = answer;
        return acc;
      },
      {} as Record<string, PracticeAnswer>,
    );
  }, [answers]);

  const columns = useMemo<ProColumns<Question>[]>(
    () => [
      {
        title: '题目ID',
        dataIndex: 'id',
        width: 150,
        ellipsis: true,
        render: (id: any) => {
          return (
            <Link className="umi-link" to={`/question/detail/${id}`}>
              {id}
            </Link>
          );
        },
      },
      {
        title: '题型',
        dataIndex: 'question_type_code',
        width: 120,
      },
      {
        title: '题目内容',
        dataIndex: ['stem', 'text'],
        width: 300,
        ellipsis: true,
      },
      {
        title: '难度',
        dataIndex: 'difficulty',
        width: 100,
      },
      {
        title: '知识点',
        dataIndex: 'knowledge_points',
        width: 150,
        ellipsis: true,
        render: (_, record) => record.knowledge_points?.join(', ') || '-',
      },
      {
        title: '是否作答',
        dataIndex: 'id',
        width: 100,
        render: (questionId: any) => {
          const answer = answersMap[questionId];
          return (
            <Tag color={answer?.status !== 0 ? 'success' : 'default'}>{answer?.status !== 0 ? '已作答' : '未作答'}</Tag>
          );
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
        width: 120,
        render: (questionId: any) => {
          const answer = answersMap[questionId];
          if (!answer || !answer.time_spent) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          const seconds = answer.time_spent;
          if (seconds < 60) {
            return `${seconds}秒`;
          }
          return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
        },
      },
      createActionColumn<Question>(
        (record) => (
          <Button type="link" size="small" onClick={() => setSelectedQuestion(record)}>
            详情
          </Button>
        ),
        { width: 100 },
      ),
    ],
    [answersMap],
  );

  if (!data && !error) {
    return <ProSkeleton type="descriptions" />;
  }

  if (error) {
    return (
      <PageContainer>
        <Empty
          description={
            <div>
              <div style={{ marginBottom: 8 }}>加载失败</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{error?.message || '请检查网络连接或稍后重试'}</div>
            </div>
          }
        >
          <Button type="primary" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  if (!data || !session) {
    return (
      <PageContainer>
        <Empty description="练习详情不存在">
          <Button type="primary" onClick={() => navigate(-1)}>
            返回上一页
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="练习详情" header={{ onBack: () => navigate(-1) }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="基本信息">
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="练习类型">
              <Tag color="blue">{PRACTICE_SLUG_LABELS[session.practice_slug] || session.practice_slug}</Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <Tag color={PRACTICE_STATUS_COLORS[session.status as PracticeStatus]}>
                {PRACTICE_STATUS_LABELS[session.status as PracticeStatus]}
              </Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="开始时间" valueType="dateTime">
              {formatDateTime(session.start_time)}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="结束时间" valueType="dateTime">
              {formatDateTime(session.end_time)}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {formatDateTime(session.create_time)}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="更新时间" valueType="dateTime">
              {formatDateTime(session.update_time)}
            </ProDescriptions.Item>
          </ProDescriptions>
        </Card>
        <Card title="练习进度">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="总题数" value={session.question_count} suffix="题" />
            </Col>
            <Col span={6}>
              <Statistic title="已完成" value={session.answer_count} suffix="题" />
            </Col>
            <Col span={6}>
              <Statistic title="正确" value={session.correct_count} suffix="题" />
            </Col>
            <Col span={6}>
              <Statistic title="错误" value={session.answer_count - session.correct_count} suffix="题" />
            </Col>
          </Row>
        </Card>

        <Card title={`题目列表（共 ${session.question_count} 题）`}>
          <ProTable<Question>
            rowKey="id"
            columns={columns}
            search={false}
            pagination={false}
            dataSource={questions}
            loading={loading}
            options={false}
            toolbar={{ actions: [] }}
            scroll={{ x: 'max-content' }}
          />
        </Card>

        <QuestionDetailDrawer
          open={!!selectedQuestion}
          onClose={() => setSelectedQuestion(undefined)}
          question={selectedQuestion}
          answer={selectedQuestion ? answersMap[selectedQuestion.id] : undefined}
        />
      </Space>
    </PageContainer>
  );
}

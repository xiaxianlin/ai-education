import { useParams, useNavigate } from 'react-router-dom';
import {
  PageContainer,
  ProDescriptions,
  ProTable,
  ProColumns,
  ProSkeleton,
} from '@ant-design/pro-components';
import { adminApi } from '@/lib/api';
import { useRequest } from 'ahooks';
import { Button, Card, Space, Tag, Empty, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { SetStateAction, useMemo, useState } from 'react';
import { QuestionDetailDrawer } from './views/QuestionDetailDrawer';
import {
  PRACTICE_STATUS_COLORS,
  PRACTICE_STATUS_LABELS,
  PRACTICE_TYPE_LABELS,
} from '@/constants/practice';
import { fmtTime } from '@/utils/time';
import { PageHeader } from '@/components/business';

export default function PracticeDetailPage() {
  const { session_id } = useParams<{ session_id: string }>();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<Question>();
  // 使用统一的会话详情接口
  const { data, loading, error } = useRequest(
    () => adminApi.getPracticeSession(Number(session_id)),
    { ready: !!session_id },
  );

  const { session, answers = [], wrong_records = [] } = data || {};

  const answersMap = useMemo(() => {
    return answers.reduce((acc: { [x: string]: PracticeAnswer }, answer: PracticeAnswer) => {
      acc[answer.question_id] = answer;
      return acc;
    }, {} as Record<number, PracticeAnswer>);
  }, [answers]);

  const wrongRecordsMap = useMemo(() => {
    return wrong_records.reduce(
      (acc: { [x: string]: PracticeWrongRecord }, record: PracticeWrongRecord) => {
        acc[record.question_id] = record;
        return acc;
      },
      {} as Record<number, PracticeWrongRecord>,
    );
  }, [wrong_records]);

  const columns = useMemo<ProColumns<Question>[]>(
    () => [
      {
        title: '题目ID',
        dataIndex: 'id',
        width: 100,
      },
      {
        title: '题型',
        dataIndex: 'type',
        width: 100,
      },
      {
        title: '题目内容',
        dataIndex: 'content',
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
        dataIndex: 'knowledge',
        width: 150,
        ellipsis: true,
      },
      {
        title: '是否作答',
        dataIndex: 'id',
        width: 100,
        renderText: (questionId: number) => {
          const answer = answersMap[questionId];
          return (
            <Tag color={answer?.status !== 0 ? 'success' : 'default'}>
              {answer?.status !== 0 ? '已作答' : '未作答'}
            </Tag>
          );
        },
      },
      {
        title: '答题结果',
        dataIndex: 'id',
        width: 100,
        renderText: (questionId: number) => {
          const answer = answersMap[questionId];
          if (answer.status === 0) {
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
        renderText: (questionId: number) => {
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
      {
        title: '操作',
        valueType: 'option',
        width: 100,
        fixed: 'right',
        render: (_: unknown, record: SetStateAction<Question | undefined>) => (
          <Button type="link" size="small" onClick={() => setSelectedQuestion(record)}>
            详情
          </Button>
        ),
      },
    ],
    [answers],
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
              <div style={{ fontSize: '12px', color: '#999' }}>
                {error?.message || '请检查网络连接或稍后重试'}
              </div>
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
    <PageContainer title={<PageHeader title="练习详情" />}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="基本信息">
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="练习类型">
              <Tag color="blue">
                {PRACTICE_TYPE_LABELS[session.session_type]}
              </Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <Tag color={PRACTICE_STATUS_COLORS[session.status as PracticeSessionStatus]}>
                {PRACTICE_STATUS_LABELS[session.status]}
              </Tag>
            </ProDescriptions.Item>
            <ProDescriptions.Item label="开始时间" valueType="dateTime">
              {fmtTime(session.start_time)}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="结束时间" valueType="dateTime">
              {fmtTime(session.end_time)}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {fmtTime(session.create_time)}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="更新时间" valueType="dateTime">
              {fmtTime(session.update_time)}
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
              <Statistic
                title="错误"
                value={session.answer_count - session.correct_count}
                suffix="题"
              />
            </Col>
          </Row>
        </Card>

        <Card className="table-card" title={`题目列表（共 ${session.question_count} 题）`}>
          <ProTable
            rowKey="id"
            columns={columns}
            search={false}
            pagination={false}
            dataSource={answers.map((answer: PracticeAnswer) => answer.question!)}
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
          answer={selectedQuestion ? answersMap[Number(selectedQuestion.id)] : undefined}
          wrongRecord={selectedQuestion ? wrongRecordsMap[Number(selectedQuestion.id)] : undefined}
        />
      </Space>
    </PageContainer>
  );
}

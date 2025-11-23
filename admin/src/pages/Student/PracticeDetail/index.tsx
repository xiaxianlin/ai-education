import { useParams, history } from '@umijs/max';
import { PageContainer, ProDescriptions, ProTable, ProColumns } from '@ant-design/pro-components';
import { StudentApi } from '@/services/student';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  Space,
  Tag,
  Empty,
  Image,
  Spin,
  Progress,
  Row,
  Col,
  Statistic,
  message,
} from 'antd';
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { fmtTime } from '@/utils/time';
import { QuestionDetailDrawer } from '@/components/business';

type PracticeType = 'daily' | 'unit' | 'assessment';

export default function PracticeDetailPage() {
  const { id, type, sessionId } = useParams<{
    id: string;
    type: PracticeType;
    sessionId: string;
  }>();

  // 抽屉状态
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  // 使用统一的会话详情接口
  const { data, loading, error } = useRequest(
    async () => {
      if (!sessionId) return null;
      const sessionIdNum = Number(sessionId);
      if (isNaN(sessionIdNum)) {
        throw new Error('无效的会话ID');
      }
      // 根据 API.md，使用统一的会话详情接口
      return await StudentApi.getSessionDetail(sessionIdNum);
    },
    {
      ready: !!sessionId,
      onError: (error: any) => {
        console.error('加载练习详情失败:', error);
        console.error('错误详情:', {
          sessionId,
          type,
          id,
          errorMessage: error?.message,
          errorResponse: error?.response,
        });
        message.error(error?.message || '加载练习详情失败，请稍后重试');
        // 延迟返回，让用户看到错误提示
        setTimeout(() => {
          history.back();
        }, 2000);
      },
    },
  );

  // 解析答案数据
  const studentAnswers = useMemo(() => {
    if (!data) return {};

    // 优先使用 answers 数组（根据 API.md 规范）
    if (data.answers && Array.isArray(data.answers)) {
      const answers: Record<number, any> = {};
      data.answers.forEach((answer: any) => {
        // is_correct: 0-未答, 1-正确, 2-错误
        const isCorrectValue =
          answer.is_correct !== undefined && answer.is_correct !== null ? answer.is_correct : 0;
        const hasAnswered = isCorrectValue !== 0;

        answers[answer.question_id] = {
          is_correct: isCorrectValue, // 保存原始值 0/1/2，用于计算
          has_answered: hasAnswered,
          answer: answer.text_answer || answer.question_content || '',
          time_spent: answer.time_spent || 0,
          audio_data: answer.audio_data,
          submit_time: answer.submit_time,
          question_order: answer.question_order,
        };
      });
      return answers;
    }

    // 兼容：从 questions 中获取答案（能力评估）
    if (data.questions && Array.isArray(data.questions)) {
      const answers: Record<number, any> = {};
      data.questions.forEach((q: any) => {
        if (q.is_correct !== undefined) {
          answers[q.id] = {
            is_correct: q.is_correct,
            has_answered: true,
            answer: q.answer || '',
          };
        }
      });
      return answers;
    }

    // 兼容：从 session.answers JSON 字符串解析
    if (data.session?.answers && typeof data.session.answers === 'string') {
      try {
        return JSON.parse(data.session.answers);
      } catch (e) {
        console.error('Failed to parse answers:', e);
      }
    }

    return {};
  }, [data]);

  // 从 answers 数组中提取题目列表
  const questions = useMemo(() => {
    if (!data) return [];

    // 优先从 answers 数组中提取题目（后端返回的数据结构）
    if (data.answers && Array.isArray(data.answers) && data.answers.length > 0) {
      const questionMap = new Map<number, any>();
      data.answers.forEach((answer: any) => {
        // 如果 answer 中有 question 对象，使用它
        if (answer.question && !questionMap.has(answer.question.id)) {
          questionMap.set(answer.question.id, {
            ...answer.question,
            order: answer.question_order || answer.question.order || 0,
          });
        }
        // 如果没有 question 对象但有 question_content，创建一个简化的题目对象
        else if (
          answer.question_id &&
          answer.question_content &&
          !questionMap.has(answer.question_id)
        ) {
          questionMap.set(answer.question_id, {
            id: answer.question_id,
            content: answer.question_content,
            order: answer.question_order || 0,
          });
        }
      });
      // 按 order 排序
      const questionList = Array.from(questionMap.values());
      return questionList.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // 兼容：从 questions 字段获取
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions;
    }

    // 兼容：从 session.questions 获取
    if (data.session?.questions && Array.isArray(data.session.questions)) {
      return data.session.questions;
    }

    return [];
  }, [data]);

  // 获取标题
  const getTitle = () => {
    switch (type) {
      case 'daily':
        return '日常练习详情';
      case 'unit':
        return '单元练习详情';
      case 'assessment':
        return '能力评测详情';
      default:
        return '练习详情';
    }
  };

  // 获取会话信息
  const session = data?.session;
  const unit = (data as any)?.unit; // unit 只在 unit practice 中存在
  const report = data?.report;

  // 调试信息
  if (data && !session) {
    console.warn('数据已加载但 session 不存在:', data);
  }

  // 计算统计数据（优先使用 report，否则通过 is_correct 计算）
  const totalQuestions = report?.total_questions || session?.question_count || questions.length;

  // 通过 is_correct 判断：0-未答, 1-正确, 2-错误
  const answerValues = Object.values(studentAnswers) as any[];

  // 已完成数量：is_correct 为 1 或 2 的数量（即 is_correct !== 0）
  const answeredCount = report?.total_questions
    ? session?.answer_count || 0
    : answerValues.filter(
        (ans: any) =>
          ans.is_correct !== undefined && ans.is_correct !== null && ans.is_correct !== 0,
      ).length;

  // 正确数量：is_correct === 1 的数量
  const correctCount =
    report?.correct_questions ||
    session?.correct_count ||
    answerValues.filter((ans: any) => ans.is_correct === 1).length;

  // 错误数量：is_correct === 2 的数量
  const wrongCount = report?.total_questions
    ? answeredCount - correctCount
    : answerValues.filter((ans: any) => ans.is_correct === 2).length;

  const unansweredCount = totalQuestions - answeredCount;
  const progressPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : '0';

  const columns = useMemo<ProColumns<any>[]>(
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
        render: (text: string) => (
          <div
            style={{
              maxHeight: '60px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={text}
          >
            {text}
          </div>
        ),
      },
      {
        title: '难度',
        dataIndex: 'difficulty',
        width: 100,
        render: (difficulty: string) => (
          <Tag color={difficulty === 'hard' ? 'red' : difficulty === 'medium' ? 'orange' : 'green'}>
            {difficulty === 'hard' ? '困难' : difficulty === 'medium' ? '中等' : '简单'}
          </Tag>
        ),
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
        render: (questionId: number) => {
          const answerData = studentAnswers[questionId];
          // 通过 is_correct 判断：0-未答, 1-正确, 2-错误
          const hasAnswered =
            answerData?.is_correct !== undefined &&
            answerData?.is_correct !== null &&
            answerData?.is_correct !== 0;
          return (
            <Tag color={hasAnswered ? 'success' : 'default'}>
              {hasAnswered ? '已作答' : '未作答'}
            </Tag>
          );
        },
      },
      {
        title: '答题结果',
        dataIndex: 'id',
        width: 100,
        render: (questionId: number) => {
          const answerData = studentAnswers[questionId];
          // 通过 is_correct 判断：0-未答, 1-正确, 2-错误
          if (
            !answerData ||
            answerData.is_correct === undefined ||
            answerData.is_correct === null ||
            answerData.is_correct === 0
          ) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          const isCorrect = answerData.is_correct === 1;
          return <Tag color={isCorrect ? 'success' : 'error'}>{isCorrect ? '正确' : '错误'}</Tag>;
        },
      },
      {
        title: '答题耗时',
        dataIndex: 'id',
        width: 120,
        render: (questionId: number) => {
          const answerData = studentAnswers[questionId];
          if (!answerData || !answerData.time_spent) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          const seconds = answerData.time_spent;
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
        render: (_, record) => (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedQuestion(record);
              setDrawerVisible(true);
            }}
          >
            详情
          </Button>
        ),
      },
    ],
    [studentAnswers, type, questions],
  );

  if (loading) {
    return (
      <PageContainer loading>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
        </div>
      </PageContainer>
    );
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
          <Button type="primary" onClick={() => history.back()}>
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
          <Button type="primary" onClick={() => history.back()}>
            返回上一页
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
            style={{ padding: 0, height: 'auto' }}
          />
          <span>{getTitle()}</span>
        </div>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 练习进度卡片 */}
        <Card
          title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📈 练习进度</span>}
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                  已完成 {answeredCount} / {totalQuestions} 题
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1890ff' }}>
                  {progressPercent}%
                </span>
              </div>
              <Progress
                percent={progressPercent}
                status={(() => {
                  const statusNum =
                    typeof session.status === 'number'
                      ? session.status
                      : session.status === 'completed'
                      ? 2
                      : session.status === 'in_progress'
                      ? 1
                      : 0;
                  return statusNum === 2 ? 'success' : 'active';
                })()}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                style={{ marginBottom: 16 }}
              />
            </div>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="总题数"
                  value={totalQuestions}
                  suffix="题"
                  valueStyle={{ fontSize: '20px', fontWeight: 'bold' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已完成"
                  value={answeredCount}
                  suffix="题"
                  valueStyle={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="正确"
                  value={correctCount}
                  suffix="题"
                  valueStyle={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="错误"
                  value={wrongCount}
                  suffix="题"
                  valueStyle={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}
                />
              </Col>
            </Row>
            {unansweredCount > 0 && (
              <div style={{ marginTop: 8 }}>
                <Tag color="default">未答题: {unansweredCount} 题</Tag>
              </div>
            )}
          </Space>
        </Card>

        {/* 练习信息卡片 */}
        <Card title="练习信息">
          <ProDescriptions column={3}>
            {type === 'daily' && (
              <>
                <ProDescriptions.Item label="练习日期">
                  {(() => {
                    // 优先使用 date 字段，如果没有则使用 target_id（每日练习的日期存储在 target_id 中）
                    const dateValue = (session as any).date || (session as any).target_id;
                    if (!dateValue) {
                      return '-';
                    }
                    const dateStr = String(dateValue);
                    // 确保日期字符串长度至少为 8 位（YYYYMMDD）
                    if (dateStr.length < 8) {
                      return dateStr;
                    }
                    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
                  })()}
                </ProDescriptions.Item>
              </>
            )}
            {type === 'unit' && unit && (
              <ProDescriptions.Item label="单元名称">{unit.name || '-'}</ProDescriptions.Item>
            )}
            {type === 'assessment' && (
              <>
                <ProDescriptions.Item label="评测类型">
                  <Tag color="blue">
                    {(session as any).assessment_type === 'unit'
                      ? '单元评测'
                      : (session as any).assessment_type === 'comprehensive'
                      ? '综合评测'
                      : '专题评测'}
                  </Tag>
                </ProDescriptions.Item>
                {(session as any).target_id && (
                  <ProDescriptions.Item label="目标ID">
                    {(session as any).target_id}
                  </ProDescriptions.Item>
                )}
              </>
            )}
            <ProDescriptions.Item label="总题数">{totalQuestions} 题</ProDescriptions.Item>
            {type !== 'assessment' && (
              <>
                <ProDescriptions.Item label="正确题数">
                  {(session as any).correct_questions || correctCount} 题
                </ProDescriptions.Item>
                <ProDescriptions.Item label="准确率">{accuracy}%</ProDescriptions.Item>
                {(session as any).score !== undefined && (
                  <ProDescriptions.Item label="得分">
                    {(session as any).score.toFixed(1)} 分
                  </ProDescriptions.Item>
                )}
              </>
            )}
            {type === 'assessment' && (
              <>
                <ProDescriptions.Item label="能力值">
                  {(session as any).current_ability?.toFixed(2) || '-'}
                </ProDescriptions.Item>
                <ProDescriptions.Item label="能力等级">
                  <Tag
                    color={
                      (session as any).ability_level === 'advanced'
                        ? 'red'
                        : (session as any).ability_level === 'intermediate'
                        ? 'orange'
                        : 'green'
                    }
                  >
                    {(session as any).ability_level === 'advanced'
                      ? '高级'
                      : (session as any).ability_level === 'intermediate'
                      ? '中级'
                      : (session as any).ability_level === 'beginner'
                      ? '初级'
                      : '-'}
                  </Tag>
                </ProDescriptions.Item>
                {(session as any).overall_score !== undefined && (
                  <ProDescriptions.Item label="总分">
                    {(session as any).overall_score.toFixed(1)}
                  </ProDescriptions.Item>
                )}
                {(session as any).confidence !== undefined && (
                  <ProDescriptions.Item label="置信度">
                    {((session as any).confidence * 100).toFixed(1)}%
                  </ProDescriptions.Item>
                )}
              </>
            )}
            {type === 'unit' && (session as any).difficulty && (
              <ProDescriptions.Item label="难度">
                <Tag
                  color={
                    (session as any).difficulty === 'hard'
                      ? 'red'
                      : (session as any).difficulty === 'medium'
                      ? 'orange'
                      : 'blue'
                  }
                >
                  {(session as any).difficulty === 'hard'
                    ? '困难'
                    : (session as any).difficulty === 'medium'
                    ? '中等'
                    : (session as any).difficulty === 'easy'
                    ? '简单'
                    : '自适应'}
                </Tag>
              </ProDescriptions.Item>
            )}
            <ProDescriptions.Item label="状态">
              {(() => {
                const statusNum =
                  typeof session.status === 'number'
                    ? session.status
                    : session.status === 'completed'
                    ? 2
                    : session.status === 'in_progress'
                    ? 1
                    : 0;
                const isCompleted = statusNum === 2;
                return (
                  <Tag color={isCompleted ? 'success' : statusNum === 1 ? 'warning' : 'default'}>
                    {isCompleted ? '已完成' : statusNum === 1 ? '进行中' : '未开始'}
                  </Tag>
                );
              })()}
            </ProDescriptions.Item>
            {(session as any).total_time > 0 && (
              <ProDescriptions.Item label="总用时">
                {Math.floor((session as any).total_time / 60)} 分{(session as any).total_time % 60}{' '}
                秒
              </ProDescriptions.Item>
            )}
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {(session as any).create_time * 1000 || (session as any).start_time * 1000}
            </ProDescriptions.Item>
            {(session as any).update_time && (
              <ProDescriptions.Item label="更新时间" valueType="dateTime">
                {(session as any).update_time * 1000}
              </ProDescriptions.Item>
            )}
            {(session as any).end_time && (
              <ProDescriptions.Item label="结束时间" valueType="dateTime">
                {(session as any).end_time * 1000}
              </ProDescriptions.Item>
            )}
          </ProDescriptions>
        </Card>

        {/* 题目列表 */}
        <Card title={`题目列表（共 ${questions.length} 题）`}>
          <ProTable
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

        {/* 题目详情抽屉 */}
        <QuestionDetailDrawer
          open={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          question={selectedQuestion}
          studentAnswer={selectedQuestion ? studentAnswers[selectedQuestion.id] : null}
        />
      </Space>
    </PageContainer>
  );
}

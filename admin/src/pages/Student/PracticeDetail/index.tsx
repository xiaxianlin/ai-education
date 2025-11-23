import { useParams, history } from '@umijs/max';
import { PageContainer, ProDescriptions, ProTable, ProColumns } from '@ant-design/pro-components';
import { StudentApi } from '@/services/student';
import { useRequest } from 'ahooks';
import { Button, Card, Space, Tag, Empty, Image, Spin, Progress, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { fmtTime } from '@/utils/time';
import { AudioPlayer } from '@/components/ui';

type PracticeType = 'daily' | 'unit' | 'assessment';

export default function PracticeDetailPage() {
  const { id, type, sessionId } = useParams<{
    id: string;
    type: PracticeType;
    sessionId: string;
  }>();

  // 使用统一的会话详情接口
  const { data, loading } = useRequest(
    async () => {
      if (!sessionId) return null;
      const sessionIdNum = Number(sessionId);
      // 根据 API.md，使用统一的会话详情接口
      return await StudentApi.getSessionDetail(sessionIdNum);
    },
    {
      ready: !!sessionId,
      onError: () => {
        history.back();
      },
    },
  );

  // 解析答案数据
  const studentAnswers = useMemo(() => {
    if (!data) return {};

    // 优先使用 answers 数组（根据 API.md 规范）
    if (data.answers && Array.isArray(data.answers)) {
      const answers: Record<number, any> = {};
      data.answers.forEach((answer) => {
        answers[answer.question_id] = {
          is_correct: answer.is_correct === 1,
          answer: answer.text_answer || '',
          time_spent: answer.time_spent,
          audio_data: answer.audio_data,
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
  const questions = data?.questions || data?.session?.questions || [];
  const unit = (data as any)?.unit; // unit 只在 unit practice 中存在
  const report = data?.report;

  // 计算统计数据（优先使用 report，否则计算）
  const totalQuestions = report?.total_questions || session?.question_count || questions.length;
  const answeredCount = session?.answer_count || Object.keys(studentAnswers).length;
  const correctCount =
    report?.correct_questions ||
    session?.correct_count ||
    Object.values(studentAnswers).filter((ans: any) => ans.is_correct === true).length;
  const wrongCount = answeredCount - correctCount;
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
          const hasAnswered =
            type === 'assessment'
              ? questions.some((q: any) => q.id === questionId)
              : studentAnswers[questionId] !== undefined;
          return (
            <Tag color={hasAnswered ? 'success' : 'default'}>
              {hasAnswered ? '已作答' : '未作答'}
            </Tag>
          );
        },
      },
      {
        title: '答题结果',
        dataIndex: 'is_correct',
        width: 100,
        render: (is_correct: boolean | undefined, record) => {
          if (type === 'assessment') {
            if (is_correct === undefined || is_correct === null) {
              return <span style={{ color: '#999' }}>-</span>;
            }
            return (
              <Tag color={is_correct ? 'success' : 'error'}>{is_correct ? '正确' : '错误'}</Tag>
            );
          }

          const hasAnswered = studentAnswers[record.id] !== undefined;
          if (!hasAnswered) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          const answerData = studentAnswers[record.id];
          const correct = answerData?.is_correct;
          if (correct === undefined || correct === null) {
            return <span style={{ color: '#999' }}>-</span>;
          }
          return <Tag color={correct ? 'success' : 'error'}>{correct ? '正确' : '错误'}</Tag>;
        },
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

  if (!data || !session) {
    return (
      <PageContainer>
        <Empty description="练习详情不存在" />
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
                  const statusNum = typeof session.status === 'number' ? session.status : session.status === 'completed' ? 2 : session.status === 'in_progress' ? 1 : 0;
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
                    const dateStr = String((session as any).date);
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
                const statusNum = typeof session.status === 'number' ? session.status : session.status === 'completed' ? 2 : session.status === 'in_progress' ? 1 : 0;
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
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>题目内容：</strong>
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '12px',
                        background: '#fff',
                        borderRadius: '4px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {record.content}
                    </div>
                  </div>

                  {record.options && (
                    <div style={{ marginBottom: '12px' }}>
                      <strong>选项：</strong>
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '12px',
                          background: '#fff',
                          borderRadius: '4px',
                        }}
                      >
                        {record.options.split('\n').map((option: string, index: number) => (
                          <div key={index} style={{ marginBottom: '4px' }}>
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {studentAnswers[record.id] && (
                    <div style={{ marginBottom: '12px' }}>
                      <strong>学生答案：</strong>
                      <Tag
                        color={studentAnswers[record.id].is_correct ? 'success' : 'error'}
                        style={{ marginLeft: '8px' }}
                      >
                        {studentAnswers[record.id].answer || '未作答'}
                      </Tag>
                      {studentAnswers[record.id].audio_url && (
                        <div style={{ marginTop: '8px' }}>
                          <AudioPlayer src={studentAnswers[record.id].audio_url} />
                        </div>
                      )}
                    </div>
                  )}

                  {record.answer && (
                    <div style={{ marginBottom: '12px' }}>
                      <strong>正确答案：</strong>
                      <Tag color="success" style={{ marginLeft: '8px' }}>
                        {record.answer}
                      </Tag>
                    </div>
                  )}

                  {record.resource && (
                    <div style={{ marginBottom: '12px' }}>
                      <strong>资源：</strong>
                      <div style={{ marginTop: '8px' }}>
                        {record.resource_type === 'image' && (
                          <Image
                            src={record.resource}
                            alt="题目资源"
                            style={{ maxWidth: '300px', borderRadius: '4px' }}
                          />
                        )}
                        {record.resource_type === 'audio' && <AudioPlayer src={record.resource} />}
                        {record.resource_type === 'video' && (
                          <video
                            src={record.resource}
                            controls
                            style={{ maxWidth: '300px', borderRadius: '4px' }}
                          />
                        )}
                        {!record.resource_type && (
                          <div style={{ padding: '8px', background: '#fff', borderRadius: '4px' }}>
                            {record.resource_content || record.resource}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <strong>知识点：</strong>
                    <Tag style={{ marginLeft: '8px' }}>{record.knowledge || '-'}</Tag>
                  </div>
                </div>
              ),
            }}
          />
        </Card>
      </Space>
    </PageContainer>
  );
}

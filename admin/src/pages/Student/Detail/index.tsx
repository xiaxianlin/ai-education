import { useParams, history, Link } from '@umijs/max';
import {
  PageContainer,
  ProDescriptions,
  ProTable,
  ProColumns,
  ModalForm,
  ProFormSelect,
  ProFormDigit,
  ProFormText,
  StatisticCard,
} from '@ant-design/pro-components';
import { StudentApi } from '@/services/student';
import { TextbookApi } from '@/services/textbook';
import { useRequest } from 'ahooks';
import {
  message,
  Button,
  Card,
  Space,
  Modal,
  Tabs,
  Tag,
  Row,
  Col,
  Descriptions,
  Empty,
  Progress,
  Spin,
  Tooltip,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { StatusTag } from '@/components/ui';
import { GRADES, TEXTBOOK_VERSIONS, SEMESTERS } from '@/constants/course';
import { useState, useMemo, useEffect, useRef } from 'react';
import { ProForm } from '@ant-design/pro-components';
import { fmtTime } from '@/utils/time';

const { Statistic } = StatisticCard;

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [visible, setVisible] = useState(false);
  const [form] = ProForm.useForm<{ ids: number[] }>();
  const [allTextbooks, setAllTextbooks] = useState<Textbook[]>([]);
  const [activeTab, setActiveTab] = useState('stats');

  // 今日练习相关状态
  const [todayPractice, setTodayPractice] = useState<{
    session: DailyPracticeSession | null;
    task_id: number | null;
    status: string;
    progress: number;
  } | null>(null);
  const [loadingPractice, setLoadingPractice] = useState(false);
  const [generatingPractice, setGeneratingPractice] = useState(false);

  // 编辑表单相关状态
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editForm] = ProForm.useForm<StudentUpdateForm>();

  const { runAsync: loadStudent } = useRequest(
    async () => {
      const res = await StudentApi.search({ page: 1, size: 1000 });
      const student = res.data?.find((s) => s.id === id);
      if (!student) {
        throw new Error('学生不存在');
      }
      return student;
    },
    {
      manual: true,
      onError: () => {
        message.error('加载学生失败');
        history.back();
      },
    },
  );

  const { data: student, loading, refresh: refreshStudent } = useRequest(
    () => loadStudent(),
    {
      ready: !!id,
    }
  );

  // 启用/禁用学生
  const { runAsync: handleToggleStatus, loading: toggling } = useRequest(
    async (status: number) => {
      await StudentApi.update(id!, { status });
    },
    {
      manual: true,
      onSuccess: (_, [status]) => {
        message.success(status === 1 ? '启用成功' : '停用成功');
        refreshStudent();
      },
      onError: () => {
        message.error('操作失败');
      },
    },
  );

  const handleUpdateStatus = () => {
    const newStatus = student?.status === 1 ? 0 : 1;
    Modal.confirm({
      centered: true,
      title: '状态变更',
      content: `确定要${newStatus === 1 ? '启用' : '停用'}该学生吗？`,
      onOk: () => handleToggleStatus(newStatus),
    });
  };

  // 重置密码
  const { runAsync: handleResetPassword, loading: resetting } = useRequest(
    async () => {
      return await StudentApi.resetPassword(id!);
    },
    {
      manual: true,
      onSuccess: (password) => {
        Modal.success({
          title: '密码重置成功',
          content: `新密码：${password}，请妥善保管`,
          okText: '确定',
        });
      },
      onError: () => {
        message.error('重置失败');
      },
    },
  );

  const handleResetPasswordClick = () => {
    Modal.confirm({
      centered: true,
      title: '重置密码',
      content: '确定要重置该学生的密码吗？重置后系统将生成新密码。',
      onOk: () => handleResetPassword(),
    });
  };

  // 编辑学生
  const { runAsync: handleEditSubmit, loading: editing } = useRequest(
    async (values: StudentUpdateForm) => {
      await StudentApi.update(id!, values);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('更新成功');
        setEditFormVisible(false);
        editForm.resetFields();
        refreshStudent();
      },
      onError: () => {
        message.error('更新失败');
      },
    },
  );

  const handleEdit = () => {
    if (student) {
      editForm.setFieldsValue({
        name: student.name,
        phone: student.phone,
      });
      setEditFormVisible(true);
    }
  };

  // 删除学生
  const { runAsync: handleDelete, loading: deleting } = useRequest(
    async () => {
      await StudentApi.delete(id!);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        history.push('/student');
      },
      onError: () => {
        message.error('删除失败');
      },
    },
  );

  const handleDeleteClick = () => {
    if (!student) return;
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除学生「${student.name}」吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: () => handleDelete(),
    });
  };

  const { loading: loadingTextbooks, run: refreshTextbooks } = useRequest(
    () => StudentApi.getTextbooks(id!),
    {
      ready: !!id,
      onSuccess: (data) => {
        setTextbooks(data || []);
      },
    },
  );

  // 加载所有教材列表用于选择（过滤掉已关联的）
  const { loading: loadingAllTextbooks } = useRequest(
    async () => {
      const res = await TextbookApi.search({ page: 1, size: 1000 });
      const allBooks = res.data || [];
      const availableBooks = allBooks.filter(
        (book) => !textbooks.some((tb) => tb.id === book.id)
      );
      setAllTextbooks(availableBooks);
      return availableBooks;
    },
    {
      ready: visible && !!id,
      refreshDeps: [textbooks],
    },
  );

  // 批量添加教材
  const { runAsync: handleAddTextbook, loading: adding } = useRequest(
    async (values: { ids: number[] }) => {
      const existingIds = textbooks.map((t) => t.id);
      const newTextbookIds = [...existingIds, ...values.ids.filter(id => !existingIds.includes(id))];
      await StudentApi.saveTextbooks(id!, newTextbookIds);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('添加成功');
        setVisible(false);
        form.resetFields();
        refreshTextbooks();
      },
      onError: () => {
        message.error('添加失败');
      },
    },
  );

  // 删除教材
  const handleDeleteTextbook = (textbookId: number) => {
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: '确定要删除该教材关联吗？',
      okType: 'danger',
      onOk: async () => {
        try {
          const newTextbookIds = textbooks
            .filter((t) => t.id !== textbookId)
            .map((t) => t.id);
          await StudentApi.saveTextbooks(id!, newTextbookIds);
          message.success('删除成功');
          refreshTextbooks();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 获取学生配置（用于标识当前教材）
  const { data: profile, loading: loadingProfile, refresh: refreshProfile } = useRequest(
    () => StudentApi.getProfile(id!),
    {
      ready: !!id,
    }
  );

  // 获取当前学习教材的详细信息
  const currentTextbook = profile?.current_textbook_id
    ? textbooks.find((t) => t.id === profile.current_textbook_id)
    : null;

  // 定义教材列表列（使用 useMemo 确保响应 profile 变化）
  const textbookColumns: ProColumns<Textbook>[] = useMemo(() => [
    {
      title: '科目',
      dataIndex: 'subject',
      width: 100,
      render: (text, record) => {
        const isCurrent = profile?.current_textbook_id === record.id;
        return (
          <div className="flex items-center gap-2">
            <span>{text}</span>
            {isCurrent && (
              <Tag color="blue">当前学习</Tag>
            )}
          </div>
        );
      },
    },
    {
      title: '版本',
      dataIndex: 'version',
      width: 100,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      width: 100,
      renderText: (grade) => GRADES[grade]?.grade || grade,
    },
    {
      title: '学期',
      dataIndex: 'semester',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status) => <StatusTag status={status === 1} />,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          size="small"
          type="link"
          danger
          onClick={() => handleDeleteTextbook(record.id)}
        >
          删除
        </Button>
      ),
    },
  ], [profile]);

  // 获取学习统计
  const { data: stats, loading: loadingStats, refresh: refreshStats } = useRequest(
    () => StudentApi.getStats(id!),
    {
      ready: !!id && activeTab === 'stats',
    }
  );

  // 获取学习记录
  const { data: records, loading: loadingRecords, run: refreshRecords } = useRequest(
    (params?: any) => StudentApi.getRecords(id!, params),
    {
      ready: !!id && activeTab === 'records',
    }
  );

  // 获取错题列表
  const {
    data: wrongQuestions,
    loading: loadingWrongQuestions,
    run: refreshWrongQuestions,
  } = useRequest(
    (params?: any) => StudentApi.getWrongQuestions(id!, params),
    {
      ready: !!id && activeTab === 'wrong',
    }
  );

  // 加载今日练习状态（调用generate API来检查状态）
  const { data: todayPracticeData, loading: loadingTodayPractice, refresh: refreshTodayPractice } = useRequest(
    () => StudentApi.generateDailyPractice(id!),
    {
      ready: !!id,
      onSuccess: (data) => {
        setTodayPractice(data);
        // 如果有完成的练习数据，刷新统计数据
        if (data.session && data.session.status === 'completed') {
          refreshStats();
          refreshRecords();
        }
      },
    }
  );

  // 手动生成今日练习
  const handleGenerateDailyPractice = async () => {
    if (!id) return;
    try {
      setGeneratingPractice(true);
      const data = await StudentApi.generateDailyPractice(id);
      setTodayPractice(data);
      if (data.session) {
        message.success('今日练习已生成');
        // 如果有完成的练习数据，刷新统计数据
        if (data.session.status === 'completed') {
          refreshStats();
          refreshRecords();
        }
      } else {
        message.success('今日练习生成任务已创建');
      }
      refreshTodayPractice();
    } catch (error) {
      message.error('生成失败');
    } finally {
      setGeneratingPractice(false);
    }
  };


  // 轮询任务进度：当状态为 pending 或 running 时，每3秒查询一次
  useEffect(() => {
    if (!id || !todayPractice?.status) {
      return;
    }

    // 只有在任务正在生成时才轮询（pending 或 running 状态）
    const isGenerating = ['pending', 'running'].includes(todayPractice.status);
    if (!isGenerating) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const data = await StudentApi.generateDailyPractice(id);
        setTodayPractice(data);

        // 如果任务完成（有 session 或状态不再是 pending/running），停止轮询
        if (data.session || !['pending', 'running'].includes(data.status)) {
          clearInterval(pollInterval);
          if (data.session) {
            message.success('今日练习生成完成！');
            // 刷新统计数据和学习记录
            refreshStats();
            refreshRecords();
          } else if (data.status === 'failed') {
            message.error('今日练习生成失败，请重试');
          }
        }
      } catch (error) {
        console.error('查询任务进度失败:', error);
      }
    }, 3000); // 每3秒查询一次

    return () => clearInterval(pollInterval);
  }, [id, todayPractice?.status, refreshStats, refreshRecords]);

  // 保存学习配置
  const { runAsync: handleSaveProfile, loading: savingProfile } = useRequest(
    async (values: any) => {
      await StudentApi.saveProfile(id!, values);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('配置保存成功');
        refreshRecords(); // 刷新以重新获取数据
      },
      onError: () => {
        message.error('保存失败');
      },
    },
  );

  // 标记错题为已掌握
  const { runAsync: handleMarkAsMastered, loading: marking } = useRequest(
    async (questionId: number) => {
      await StudentApi.markQuestionAsMastered(id!, questionId);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('已标记为已掌握');
        refreshWrongQuestions();
      },
      onError: () => {
        message.error('操作失败');
      },
    },
  );

  // 取消错题掌握状态
  const { runAsync: handleUnmarkAsMastered, loading: unmarking } = useRequest(
    async (questionId: number) => {
      await StudentApi.unmarkQuestionAsMastered(id!, questionId);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('已标记为未掌握');
        refreshWrongQuestions();
      },
      onError: () => {
        message.error('操作失败');
      },
    },
  );

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!student) {
    return null;
  }

  const recordColumns: ProColumns<StudyRecord>[] = [
    {
      title: '题目ID',
      dataIndex: 'question_id',
      width: 100,
    },
    {
      title: '是否正确',
      dataIndex: 'is_correct',
      width: 100,
      render: (is_correct) => (
        <Tag color={is_correct === 1 ? 'green' : 'red'}>
          {is_correct === 1 ? '正确' : '错误'}
        </Tag>
      ),
    },
    {
      title: '得分',
      dataIndex: 'score',
      width: 100,
    },
    {
      title: '用时（秒）',
      dataIndex: 'time_spent',
      width: 100,
    },
    {
      title: '教材ID',
      dataIndex: 'textbook_id',
      width: 100,
    },
    {
      title: '学习时间',
      dataIndex: 'study_date',
      width: 150,
      valueType: 'dateTime',
      renderText: (timestamp) => timestamp * 1000,
    },
  ];

  const wrongQuestionColumns: ProColumns<StudentWrongQuestion>[] = [
    {
      title: '题目ID',
      dataIndex: 'question_id',
      width: 100,
    },
    {
      title: '错题内容',
      dataIndex: 'question_content',
      width: 300,
      ellipsis: true,
    },
    {
      title: '错误次数',
      dataIndex: 'wrong_count',
      width: 100,
    },
    {
      title: '掌握状态',
      dataIndex: 'is_mastered',
      width: 100,
      render: (is_mastered) => (
        <Tag color={is_mastered === 1 ? 'green' : 'orange'}>
          {is_mastered === 1 ? '已掌握' : '未掌握'}
        </Tag>
      ),
    },
    {
      title: '最后错误时间',
      dataIndex: 'last_wrong_time',
      width: 150,
      valueType: 'dateTime',
      renderText: (timestamp) => timestamp * 1000,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.is_mastered === 0 ? (
            <Button
              size="small"
              type="link"
              loading={marking}
              onClick={() => handleMarkAsMastered(record.question_id)}
            >
              标记掌握
            </Button>
          ) : (
            <Button
              size="small"
              type="link"
              loading={unmarking}
              onClick={() => handleUnmarkAsMastered(record.question_id)}
            >
              取消掌握
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'stats',
      label: '学习统计',
      children: (
        <Card loading={loadingStats}>
          {stats ? (
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="练习次数"
                  value={stats.total_practice}
                  prefix="📚"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="完成题目"
                  value={stats.total_questions}
                  prefix="✏️"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="平均正确率"
                  value={Math.round(stats.accuracy)}
                  suffix="%"
                  prefix="✅"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="连续天数"
                  value={stats.current_streak}
                  prefix="🔥"
                />
              </Col>
            </Row>
          ) : (
            <div>暂无统计信息</div>
          )}
        </Card>
      ),
    },
    {
      key: 'records',
      label: '学习记录',
      children: (
        <ProTable<StudyRecord>
          rowKey="id"
          columns={recordColumns}
          search={false}
          pagination={{ pageSize: 10 }}
          dataSource={records?.data || []}
          loading={loadingRecords}
          options={false}
          toolbar={{ actions: [] }}
        />
      ),
    },
    {
      key: 'wrong',
      label: '错题本',
      children: (
        <ProTable<StudentWrongQuestion>
          rowKey="id"
          columns={wrongQuestionColumns}
          search={false}
          pagination={{ pageSize: 10 }}
          dataSource={wrongQuestions?.data || []}
          loading={loadingWrongQuestions}
          options={false}
          toolbar={{ actions: [] }}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="学生详情"
      header={{
        breadcrumb: {},
        extra: [
          <Button key="edit" type="primary" onClick={handleEdit}>
            编辑
          </Button>,
          <Button key="delete" danger loading={deleting} onClick={handleDeleteClick}>
            删除
          </Button>,
          <Button key="reset" loading={resetting} onClick={handleResetPasswordClick}>
            重置密码
          </Button>,
          <Button
            key="status"
            type={student?.status === 1 ? 'default' : 'primary'}
            danger={student?.status === 1}
            loading={toggling}
            onClick={handleUpdateStatus}
          >
            {student?.status === 1 ? '停用' : '启用'}
          </Button>,
          <Button key="back" onClick={() => history.back()}>
            返回
          </Button>,
        ],
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="基本信息" style={{ marginTop: 24 }}>
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="学生ID">{student.id}</ProDescriptions.Item>
            <ProDescriptions.Item label="姓名">{student.name}</ProDescriptions.Item>
            <ProDescriptions.Item label="手机号">{student.phone}</ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <StatusTag status={student.status === 1} />
            </ProDescriptions.Item>
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {student.create_time * 1000}
            </ProDescriptions.Item>
            {student.update_time && (
              <ProDescriptions.Item label="更新时间" valueType="dateTime">
                {student.update_time * 1000}
              </ProDescriptions.Item>
            )}
          </ProDescriptions>
        </Card>

        <Card
          title="关联教材"
          loading={loadingTextbooks}
          extra={
            <Button type="primary" onClick={() => setVisible(true)}>
              添加教材
            </Button>
          }
        >
          {textbooks.length > 0 ? (
            <Row gutter={[16, 16]}>
              {textbooks.map((textbook) => {
                const isCurrent = profile?.current_textbook_id === textbook.id;
                const gradeInfo = GRADES[textbook.grade];
                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={textbook.id}>
                    <Card
                      hoverable
                      size="small"
                      style={{
                        height: '100%',
                        borderRadius: '8px',
                        border: isCurrent ? '2px solid #1890ff' : '1px solid #f0f0f0',
                        background: isCurrent ? '#e6f7ff' : '#ffffff',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                      }}
                      bodyStyle={{ padding: '12px 12px 10px' }}
                    >
                      {/* 移除按钮 - 右上角 */}
                      <Tooltip title="移除教材">
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 1,
                            cursor: 'pointer',
                          }}
                        >
                          <DeleteOutlined
                            onClick={() => handleDeleteTextbook(textbook.id)}
                            style={{
                              fontSize: '16px',
                              color: '#ff4d4f',
                              opacity: 0.6,
                              transition: 'opacity 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                          />
                        </span>
                      </Tooltip>

                      {/* 第一行：版本名称 + 当前标签 */}
                      <div style={{
                        marginBottom: '8px',
                        paddingRight: '24px', // 为右上角按钮留空间
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#262626',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1
                          }}
                          title={textbook.version}
                        >
                          {textbook.version}
                        </div>
                        {isCurrent && (
                          <Tag
                            color="success"
                            style={{
                              fontSize: '11px',
                              padding: '0 6px',
                              margin: 0,
                              borderRadius: '4px',
                              lineHeight: '20px'
                            }}
                          >
                            当前
                          </Tag>
                        )}
                      </div>

                      {/* 第二行：科目、年级、学期 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#8c8c8c'
                      }}>
                        <Tag
                          color="blue"
                          style={{
                            fontSize: '12px',
                            padding: '0 6px',
                            margin: 0,
                            borderRadius: '4px'
                          }}
                        >
                          {textbook.subject}
                        </Tag>
                        <span>{gradeInfo?.grade}</span>
                        <span style={{ color: '#d9d9d9' }}>|</span>
                        <span>{textbook.semester}</span>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span style={{ color: '#bfbfbf', fontSize: '14px' }}>暂无关联教材</span>}
              style={{ padding: '40px 0' }}
            />
          )}
        </Card>

        {/* 今日练习模块 */}
        <Card
          title={
            <span style={{ fontSize: '16px', fontWeight: 600 }}>
              📝 今日练习
            </span>
          }
          loading={loadingTodayPractice}
          extra={
            <Link to={`/student/${id}/practice-history`}>
              <Button type="link" style={{ padding: 0 }}>
                查看历史 →
              </Button>
            </Link>
          }
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {todayPractice?.session ? (
            // 已生成今日练习
            <div>
              {(() => {
                // 计算已完成题数（从 answers 字段解析）
                let answeredCount = 0;
                try {
                  if (todayPractice.session.answers) {
                    const answers = JSON.parse(todayPractice.session.answers);
                    answeredCount = Object.keys(answers).length;
                  }
                } catch (e) {
                  console.error('解析 answers 失败:', e);
                }
                return (
                  <StatisticCard.Group direction="row">
                    <StatisticCard
                      statistic={{
                        title: '总题数',
                        value: todayPractice.session.total_questions,
                        suffix: '题',
                        icon: (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            color: '#fff'
                          }}>
                            📋
                          </div>
                        ),
                      }}
                      style={{ borderRadius: '8px' }}
                    />
                    <StatisticCard
                      statistic={{
                        title: '已完成',
                        value: answeredCount,
                        suffix: '题',
                        valueStyle: { color: '#52c41a' },
                        icon: (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            color: '#fff'
                          }}>
                            ✅
                          </div>
                        ),
                      }}
                      style={{ borderRadius: '8px' }}
                    />
                    <StatisticCard
                      statistic={{
                        title: '正确',
                        value: todayPractice.session.correct_questions,
                        suffix: '题',
                        valueStyle: { color: '#1890ff' },
                        icon: (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            color: '#fff'
                          }}>
                            ✓
                          </div>
                        ),
                      }}
                      style={{ borderRadius: '8px' }}
                    />
                <StatisticCard
                  statistic={{
                    title: '得分',
                    value: todayPractice.session.score.toFixed(1),
                    suffix: '分',
                    valueStyle: { color: '#1890ff' },
                    icon: (
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#fff'
                      }}>
                        ⭐
                      </div>
                    ),
                  }}
                  style={{ borderRadius: '8px' }}
                />
                <StatisticCard
                  statistic={{
                    title: '状态',
                    value: todayPractice.session.status === 'completed' ? '已完成' : '进行中',
                    valueStyle: {
                      color: todayPractice.session.status === 'completed' ? '#52c41a' : '#faad14',
                      fontSize: '16px',
                    },
                    icon: (
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        background: todayPractice.session.status === 'completed'
                          ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
                          : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        color: '#fff'
                      }}>
                        {todayPractice.session.status === 'completed' ? '🎉' : '⏳'}
                      </div>
                    ),
                  }}
                  style={{ borderRadius: '8px' }}
                />
                  </StatisticCard.Group>
                );
              })()}
            </div>
          ) : todayPractice && ['pending', 'running'].includes(todayPractice.status) ? (
            // 正在生成（任务状态为 pending 或 running）
            <div style={{
              textAlign: 'center',
              padding: '40px 0',
              background: '#fafafa',
              borderRadius: '8px'
            }}>
              <Spin size="large" />
              <div style={{ marginTop: 20 }}>
                <Progress
                  percent={todayPractice.progress || 0}
                  status="active"
                  strokeColor={{
                    '0%': '#667eea',
                    '100%': '#764ba2',
                  }}
                />
                <div style={{ marginTop: 12, color: '#666', fontSize: '14px' }}>
                  正在生成今日练习，请稍候...（进度: {todayPractice.progress || 0}%）
                </div>
              </div>
            </div>
          ) : (
            // 未生成
            <div style={{
              textAlign: 'center',
              padding: '50px 0',
              background: '#fafafa',
              borderRadius: '8px'
            }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#999', fontSize: '14px' }}>
                    今日还未生成练习
                  </span>
                }
              >
                <Button
                  type="primary"
                  size="large"
                  loading={generatingPractice}
                  onClick={handleGenerateDailyPractice}
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  生成今日练习
                </Button>
              </Empty>
            </div>
          )}
        </Card>

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>
      </Space>

      <ModalForm<{ ids: number[] }>
        width={600}
        form={form}
        open={visible}
        title="批量添加教材"
        onFinish={handleAddTextbook}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setVisible(false);
            form.resetFields();
          },
        }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 4 }}
      >
        <div className="pt-3" />
        <ProFormSelect
          name="ids"
          label="教材"
          placeholder={loadingAllTextbooks ? '加载中...' : '请选择教材（可多选）'}
          fieldProps={{
            mode: 'multiple',
            showSearch: true,
            loading: loadingAllTextbooks,
            disabled: loadingAllTextbooks,
            maxTagCount: 'responsive',
          }}
          options={allTextbooks.map((textbook) => {
            const gradeInfo = GRADES[textbook.grade];
            const label = `${textbook.subject} - ${textbook.version} - ${
              gradeInfo?.grade || textbook.grade
            }年级 - ${textbook.semester}`;
            return {
              label,
              value: textbook.id,
            };
          })}
          rules={[{ required: true, message: '请至少选择一个教材' }]}
        />
      </ModalForm>

      <ModalForm<StudentUpdateForm>
        width={500}
        form={editForm}
        open={editFormVisible}
        title="编辑学生"
        onFinish={handleEditSubmit}
        loading={editing}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setEditFormVisible(false);
            editForm.resetFields();
          },
        }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 4 }}
      >
        <div className="pt-3" />
        <ProFormText
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
          fieldProps={{ maxLength: 50 }}
        />
        <ProFormText
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
          fieldProps={{ maxLength: 11 }}
        />
      </ModalForm>
    </PageContainer>
  );
}

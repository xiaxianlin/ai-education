import { useParams, history } from '@umijs/max';
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
} from 'antd';
import { StatusTag } from '@/components/ui';
import { GRADES, TEXTBOOK_VERSIONS, SEMESTERS } from '@/constants/course';
import { useState, useMemo } from 'react';
import { ProForm } from '@ant-design/pro-components';
import { useRef } from 'react';

const { Statistic } = StatisticCard;

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [visible, setVisible] = useState(false);
  const [form] = ProForm.useForm<{ ids: number[] }>();
  const [allTextbooks, setAllTextbooks] = useState<Textbook[]>([]);
  const [activeTab, setActiveTab] = useState('stats');

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
  const { data: stats, loading: loadingStats } = useRequest(
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

  // 获取今日练习列表
  const {
    data: dailyPractices,
    loading: loadingDailyPractices,
    run: refreshDailyPractices,
  } = useRequest(
    () => StudentApi.getDailyPractices(id!),
    {
      ready: !!id && activeTab === 'daily',
    }
  );

  // 生成今日练习
  const { runAsync: handleGenerateDailyPractice, loading: generatingDailyPractice } = useRequest(
    async () => {
      return await StudentApi.generateDailyPractice(id!);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('今日练习生成任务已创建');
        refreshDailyPractices();
      },
      onError: () => {
        message.error('生成失败');
      },
    },
  );

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

  const dailyPracticeColumns: ProColumns<DailyPracticeSession>[] = [
    {
      title: '日期',
      dataIndex: 'date',
      width: 120,
      render: (date: number) => {
        const dateStr = date.toString();
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
      },
    },
    {
      title: '总题数',
      dataIndex: 'total_questions',
      width: 100,
    },
    {
      title: '正确数',
      dataIndex: 'correct_questions',
      width: 100,
    },
    {
      title: '得分',
      dataIndex: 'score',
      width: 100,
      render: (score: number) => `${score.toFixed(1)}分`,
    },
    {
      title: '完成度',
      dataIndex: 'status',
      width: 100,
      render: (status: string, record: DailyPracticeSession) => {
        if (status === 'completed') {
          return <Tag color="green">已完成</Tag>;
        }
        const progress = record.total_questions > 0 
          ? Math.round((record.correct_questions / record.total_questions) * 100)
          : 0;
        return <Tag color="orange">{progress}%</Tag>;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          size="small"
          type="link"
          onClick={async () => {
            try {
              const detail = await StudentApi.getDailyPracticeDetail(id!, record.id);
              Modal.info({
                title: `今日练习详情 - ${record.date}`,
                width: 800,
                content: (
                  <div>
                    <Descriptions column={2} bordered>
                      <Descriptions.Item label="总题数">{detail.session.total_questions}</Descriptions.Item>
                      <Descriptions.Item label="正确数">{detail.session.correct_questions}</Descriptions.Item>
                      <Descriptions.Item label="得分">{detail.session.score.toFixed(1)}分</Descriptions.Item>
                      <Descriptions.Item label="状态">
                        <Tag color={detail.session.status === 'completed' ? 'green' : 'orange'}>
                          {detail.session.status === 'completed' ? '已完成' : '进行中'}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                    <div style={{ marginTop: 16 }}>
                      <h4>题目列表：</h4>
                      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {detail.questions.map((q, idx) => (
                          <Card key={q.id} size="small" style={{ marginBottom: 8 }}>
                            <div>
                              <strong>题目 {idx + 1}：</strong>
                              <Tag color={q.is_correct ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                                {q.is_correct ? '正确' : '错误'}
                              </Tag>
                            </div>
                            <div style={{ marginTop: 8 }}>{q.content}</div>
                            {q.answer && (
                              <div style={{ marginTop: 8, color: '#666' }}>
                                答案：{q.answer}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                ),
              });
            } catch (error: any) {
              message.error(error.message || '获取详情失败');
            }
          }}
        >
          查看问题
        </Button>
      ),
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
    {
      key: 'daily',
      label: '今日练习',
      children: (
        <Card
          extra={
            <Button
              type="primary"
              loading={generatingDailyPractice}
              onClick={handleGenerateDailyPractice}
            >
              生成今日练习
            </Button>
          }
        >
          <ProTable<DailyPracticeSession>
            rowKey="id"
            columns={dailyPracticeColumns}
            search={false}
            pagination={{ pageSize: 10 }}
            dataSource={dailyPractices?.data || []}
            loading={loadingDailyPractices}
            options={false}
            toolbar={{ actions: [] }}
          />
        </Card>
      ),
    },
  ];

  return (
    <PageContainer
      title="学生详情"
      header={{
        breadcrumb: {},
        extra: [
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
        <Card title="基本信息">
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
          <ProTable<Textbook>
            rowKey="id"
            columns={textbookColumns}
            search={false}
            pagination={false}
            dataSource={textbooks}
            options={false}
            toolbar={{ actions: [] }}
            rowClassName={(record) => {
              return profile?.current_textbook_id === record.id ? 'bg-blue-50' : '';
            }}
          />
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
          destroyOnClose: true,
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
    </PageContainer>
  );
}

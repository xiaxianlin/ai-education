import { PageContainer, StatisticCard, ProDescriptions } from '@ant-design/pro-components';
import {
  Card,
  Col,
  Row,
  List,
  Avatar,
  Progress,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Divider,
  Statistic,
} from 'antd';
import {
  UserOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { StudentApi } from '@/services/student';
import { TextbookApi } from '@/services/textbook';
import { QuestionApi } from '@/services/question';
import { useState } from 'react';
import { Link } from '@umijs/max';
import { GRADES } from '@/constants/course';

const { Title, Text } = Typography;

export default function MainView() {
  const [greeting, setGreeting] = useState('');

  // 获取系统概览数据
  const { data: studentData, loading: loadingStudent } = useRequest(
    async () => {
      const res = await StudentApi.search({ page: 1, size: 1000 });
      return res;
    }
  );

  const { data: textbookData, loading: loadingTextbook } = useRequest(
    async () => {
      const res = await TextbookApi.search({ page: 1, size: 1000 });
      return res;
    }
  );

  const { data: questionData, loading: loadingQuestion } = useRequest(
    async () => {
      const res = await QuestionApi.search({ page: 1, size: 1000 });
      return res;
    }
  );

  // 计算统计数据
  const totalStudents = studentData?.data?.length || 0;
  const activeStudents = studentData?.data?.filter((s) => s.status === 1).length || 0;
  const totalTextbooks = textbookData?.data?.length || 0;
  const totalQuestions = questionData?.data?.length || 0;

  // 问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const currentGreeting = getGreeting();

  // 学生年级分布数据
  const gradeDistribution = Array.from({ length: 12 }, (_, i) => {
    const gradeId = i + 1;
    const count = studentData?.data?.filter((s) => s.grade === gradeId).length || 0;
    return { grade: gradeId, count };
  }).filter((item) => item.count > 0);

  // 最近学生数据
  const recentStudents = studentData?.data
    ?.sort((a, b) => b.create_time - a.create_time)
    .slice(0, 5) || [];

  // 最近活动模拟数据
  const recentActivities = [
    {
      id: 1,
      type: '学生注册',
      user: '张三',
      time: '2分钟前',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    },
    {
      id: 2,
      type: '完成练习',
      user: '李四',
      time: '5分钟前',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi',
    },
    {
      id: 3,
      type: '新增教材',
      user: '王老师',
      time: '10分钟前',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang',
    },
  ];

  // 快速操作菜单
  const quickActions = [
    {
      title: '学生管理',
      description: '查看和管理所有学生',
      icon: <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      link: '/student',
    },
    {
      title: '教材管理',
      description: '管理教材和课程',
      icon: <BookOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      link: '/textbook',
    },
    {
      title: '题目管理',
      description: '管理题库和题目',
      icon: <QuestionCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      link: '/question',
    },
  ];

  // 统计卡片列配置
  const statisticItems = [
    {
      title: '学生总数',
      value: totalStudents,
      prefix: <UserOutlined />,
      valueStyle: { color: '#1890ff' },
    },
    {
      title: '活跃学生',
      value: activeStudents,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: '教材总数',
      value: totalTextbooks,
      prefix: <BookOutlined />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: '题目总数',
      value: totalQuestions,
      prefix: <QuestionCircleOutlined />,
      valueStyle: { color: '#fa8c16' },
    },
  ];

  // 学习进度表格列
  const progressColumns = [
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: number) => {
        const gradeInfo = GRADES[grade];
        return `${gradeInfo?.stage || ''} ${gradeInfo?.grade || grade}`;
      },
    },
    {
      title: '学生数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '占比',
      dataIndex: 'count',
      key: 'percentage',
      render: (count: number) => {
        const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
        return (
          <Progress
            percent={Math.round(percentage)}
            size="small"
            status="active"
          />
        );
      },
    },
  ];

  return (
    <PageContainer
      header={{ title: '' }}
      ghost
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 欢迎区域 */}
        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                {currentGreeting}，管理员 👋
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                今天是 {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </Text>
            </Col>
            <Col>
              <Space>
                <Button type="primary" ghost>
                  <Link to="/student">开始管理</Link>
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 核心指标 */}
        <Row gutter={[16, 16]}>
          {statisticItems.map((item, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card>
                <Statistic
                  title={item.title}
                  value={item.value}
                  prefix={item.prefix}
                  valueStyle={item.valueStyle}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* 主要内容区域 */}
        <Row gutter={[16, 16]}>
          {/* 左侧列 */}
          <Col xs={24} lg={16}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 学生年级分布 */}
              <Card
                title={
                  <Space>
                    <RiseOutlined />
                    <span>学生年级分布</span>
                  </Space>
                }
                loading={loadingStudent}
                extra={
                  <Button type="link">
                    <Link to="/student">查看详情</Link>
                  </Button>
                }
              >
                <Table
                  columns={progressColumns}
                  dataSource={gradeDistribution}
                  pagination={false}
                  rowKey="grade"
                  size="small"
                />
              </Card>

              {/* 最近活动 */}
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined />
                    <span>最近活动</span>
                  </Space>
                }
              >
                <List
                  itemLayout="horizontal"
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={item.avatar}
                            icon={<UserOutlined />}
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{item.user}</Text>
                            <Text type="secondary">{item.type}</Text>
                          </Space>
                        }
                        description={item.time}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          </Col>

          {/* 右侧列 */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 快速操作 */}
              <Card
                title={
                  <Space>
                    <TrophyOutlined />
                    <span>快速操作</span>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {quickActions.map((action, index) => (
                    <Card
                      key={index}
                      hoverable
                      style={{ border: '1px solid #f0f0f0' }}
                      bodyStyle={{ padding: 16 }}
                    >
                      <Link to={action.link}>
                        <Space align="start" style={{ width: '100%' }}>
                          {action.icon}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>
                              {action.title}
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {action.description}
                            </Text>
                          </div>
                        </Space>
                      </Link>
                    </Card>
                  ))}
                </Space>
              </Card>

              {/* 最近注册学生 */}
              <Card
                title={
                  <Space>
                    <UserOutlined />
                    <span>最近注册</span>
                  </Space>
                }
                loading={loadingStudent}
                extra={
                  <Button type="link">
                    <Link to="/student">查看全部</Link>
                  </Button>
                }
              >
                <List
                  itemLayout="horizontal"
                  dataSource={recentStudents}
                  renderItem={(student) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#1890ff' }}
                          >
                            {student.name?.charAt(0)}
                          </Avatar>
                        }
                        title={
                          <Space>
                            <Text strong>{student.name}</Text>
                            <Tag color={student.status === 1 ? 'green' : 'red'}>
                              {student.status === 1 ? '活跃' : '停用'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(student.create_time * 1000).toLocaleDateString()}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>

              {/* 系统状态 */}
              <Card
                title={
                  <Space>
                    <ExclamationCircleOutlined />
                    <span>系统状态</span>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">数据库状态</Text>
                    <Progress
                      percent={100}
                      status="success"
                      size="small"
                      showInfo={false}
                    />
                  </div>
                  <div>
                    <Text type="secondary">API响应时间</Text>
                    <Progress
                      percent={95}
                      status="active"
                      size="small"
                      showInfo={false}
                    />
                  </div>
                  <div>
                    <Text type="secondary">系统负载</Text>
                    <Progress
                      percent={60}
                      status="normal"
                      size="small"
                      showInfo={false}
                    />
                  </div>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </Space>
    </PageContainer>
  );
}

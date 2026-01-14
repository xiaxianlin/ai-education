import { QuestionApi } from '@/pages/Question/api';
import { StudentApi } from '@/pages/Student/api';
import { TextbookApi } from '@/pages/Textbook/api';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  RiseOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Avatar, Badge, Button, Card, Col, Divider, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    min-height: 100vh;
    padding: 24px;
    background:
      radial-gradient(circle at top right, ${token.colorPrimaryBg} 0%, transparent 40%),
      radial-gradient(circle at bottom left, ${token.colorInfoBg} 0%, transparent 40%);
  `,
  welcomeCard: css`
    background: linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%);
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      filter: blur(60px);
    }
  `,
  glassCard: css`
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      border-color: ${token.colorPrimaryBorder};
    }
  `,
  statIcon: css`
    font-size: 24px;
    padding: 12px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  `,
  quickActionBtn: css`
    height: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border-radius: 16px;
    border: 1px dashed ${token.colorBorder};
    background: transparent;
    &:hover {
      border-style: solid;
      background: ${token.colorPrimaryBg};
    }
  `,
  activityItem: css`
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    background: transparent;
    transition: background 0.2s;
    &:hover {
      background: ${token.colorFillAlter};
    }
  `,
}));

export default function MainView() {
  const { styles } = useStyles();
  const navigate = useNavigate();

  // 获取系统概览数据
  const { data: studentData, loading: studentLoading } = useRequest(async () => {
    const res = await StudentApi.searchStudents({ page: 1, size: 1000 });
    return res;
  });

  const { data: textbookData, loading: textbookLoading } = useRequest(async () => {
    return await TextbookApi.searchTextbooks();
  });

  const { data: questionData, loading: questionLoading } = useRequest(async () => {
    const res = await QuestionApi.searchQuestions({ page: 1, size: 1000 });
    return res;
  });

  // 计算统计数据
  const totalStudents = studentData?.data?.length || 0;
  const activeStudents = studentData?.data?.filter((s: any) => s.status === 1).length || 0;
  const totalTextbooks = textbookData?.length || 0;
  const totalQuestions = questionData?.total || 0;

  // 问候语
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const statisticItems = [
    {
      title: '学生总数',
      value: totalStudents,
      icon: <UserOutlined />,
      color: '#1890ff',
      bgColor: '#e6f7ff',
      trend: '+2.5%',
    },
    {
      title: '活跃学生',
      value: activeStudents,
      icon: <CheckCircleOutlined />,
      color: '#52c41a',
      bgColor: '#f6ffed',
      trend: '+1.2%',
    },
    {
      title: '教材总数',
      value: totalTextbooks,
      icon: <BookOutlined />,
      color: '#722ed1',
      bgColor: '#f9f0ff',
      trend: '+0.5%',
    },
    {
      title: '题目总数',
      value: totalQuestions,
      icon: <QuestionCircleOutlined />,
      color: '#fa8c16',
      bgColor: '#fff7e6',
      trend: '+4.3%',
    },
  ];

  const recentActivities = [
    { title: '新增学生 "李华"', time: '3分钟前', type: 'student' },
    { title: '更新了教材 "高中数学必修一"', time: '12分钟前', type: 'textbook' },
    { title: '导入了 50 道物理竞赛题', time: '1小时前', type: 'question' },
    { title: '系统备份完成', time: '2小时前', type: 'system' },
  ];

  return (
    <PageContainer header={{ title: '' }} ghost className={styles.container}>
      <Row gutter={[24, 24]}>
        {/* 左侧主要内容 */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* 欢迎区域 */}
            <Card className={styles.welcomeCard}>
              <Row align="middle" gutter={24}>
                <Col flex="1">
                  <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                    {getGreeting()}，管理员 👋
                  </Title>
                  <Paragraph style={{ color: 'rgba(255, 255, 255, 0.85)', marginTop: 8, fontSize: 16 }}>
                    欢迎回到 AI 教育管理后台。今天系统运行平稳，您可以查看最新的数据概览。
                  </Paragraph>
                  <Space size="middle">
                    <Badge
                      status="processing"
                      color="#52c41a"
                      text={<span style={{ color: 'white' }}>系统在线: 99.9%</span>}
                    />
                    <Badge
                      status="processing"
                      color="#1890ff"
                      text={<span style={{ color: 'white' }}>并发请求: 24</span>}
                    />
                  </Space>
                </Col>
                <Col xs={0} md={6} style={{ textAlign: 'right' }}>
                  <RocketOutlined style={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.2)' }} />
                </Col>
              </Row>
            </Card>

            {/* 统计卡片 */}
            <Row gutter={[16, 16]}>
              {statisticItems.map((item, index) => (
                <Col xs={12} sm={6} key={index}>
                  <Card className={styles.glassCard} bodyStyle={{ padding: 20 }}>
                    <div className={styles.statIcon} style={{ color: item.color, background: item.bgColor }}>
                      {item.icon}
                    </div>
                    <Statistic
                      title={<Text type="secondary">{item.title}</Text>}
                      value={item.value}
                      loading={studentLoading || textbookLoading || questionLoading}
                      valueStyle={{ fontSize: 28, fontWeight: 'bold' }}
                    />
                    <div style={{ marginTop: 8 }}>
                      <Tag color="success" icon={<RiseOutlined />}>
                        {item.trend}
                      </Tag>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 快捷操作 */}
            <Card title="快捷操作" className={styles.glassCard}>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Button className={styles.quickActionBtn} block type="text" onClick={() => navigate('/student')}>
                    <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <Text strong>增加学生</Text>
                  </Button>
                </Col>
                <Col xs={12} sm={6}>
                  <Button className={styles.quickActionBtn} block type="text" onClick={() => navigate('/textbook')}>
                    <BookOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <Text strong>管理教材</Text>
                  </Button>
                </Col>
                <Col xs={12} sm={6}>
                  <Button className={styles.quickActionBtn} block type="text" onClick={() => navigate('/question')}>
                    <QuestionCircleOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                    <Text strong>审阅题目</Text>
                  </Button>
                </Col>
                <Col xs={12} sm={6}>
                  <Button className={styles.quickActionBtn} block type="text" onClick={() => navigate('/practice')}>
                    <ThunderboltOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                    <Text strong>配置练习</Text>
                  </Button>
                </Col>
              </Row>
            </Card>
          </Space>
        </Col>

        {/* 右侧侧边栏 */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* 时间与日历 */}
            <Card className={styles.glassCard}>
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>
                  {dayjs().format('HH:mm')}
                </Title>
                <Text type="secondary">{dayjs().format('YYYY年MM月DD日 dddd')}</Text>
              </div>
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <SafetyCertificateOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                  <div style={{ fontSize: 12, marginTop: 4 }}>安全合规</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <ThunderboltOutlined style={{ fontSize: 24, color: '#faad14' }} />
                  <div style={{ fontSize: 12, marginTop: 4 }}>性能优异</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div style={{ fontSize: 12, marginTop: 4 }}>服务正常</div>
                </div>
              </div>
            </Card>

            {/* 最近动态 */}
            <Card title="最近动态" className={styles.glassCard} extra={<Button type="link">查看全部</Button>}>
              <List
                dataSource={recentActivities}
                renderItem={(item) => (
                  <div className={styles.activityItem}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Space size="middle">
                        <Avatar
                          size="small"
                          icon={item.type === 'student' ? <UserOutlined /> : <RocketOutlined />}
                          style={{
                            backgroundColor:
                              item.type === 'student' ? '#1890ff' : item.type === 'textbook' ? '#52c41a' : '#fa8c16',
                          }}
                        />
                        <div>
                          <Text strong style={{ fontSize: 14 }}>
                            {item.title}
                          </Text>
                          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{item.time}</div>
                        </div>
                      </Space>
                    </div>
                  </div>
                )}
              />
            </Card>
          </Space>
        </Col>
      </Row>
    </PageContainer>
  );
}

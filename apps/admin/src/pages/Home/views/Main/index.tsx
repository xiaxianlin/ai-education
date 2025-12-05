import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, Row, Progress, Button, Space, Typography, Statistic } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
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
  const { data: studentData } = useRequest(async () => {
    const res = await StudentApi.search({ page: 1, size: 1000 });
    return res;
  });

  const { data: textbookData } = useRequest(async () => {
    const res = await TextbookApi.search({ page: 1, size: 1000 });
    return res;
  });

  const { data: questionData } = useRequest(async () => {
    const res = await QuestionApi.search({ page: 1, size: 1000 });
    return res;
  });

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

  return (
    <PageContainer header={{ title: '' }} ghost>
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
                今天是{' '}
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </Text>
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
      </Space>
    </PageContainer>
  );
}

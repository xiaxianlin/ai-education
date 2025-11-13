import type { CSSProperties } from 'react';
import { Card, Empty, Button, Progress, Spin } from 'antd';
import { Link } from '@umijs/max';
import { StatisticCard } from '@ant-design/pro-components';

import { useDailyPractice } from '../hooks/useDailyPractice';
import { fmtTime } from '@/utils/time';

type PracticeCardProps = {
  id: string;
};

export function PracticeCard({ id }: PracticeCardProps) {
  const {
    todayPractice,
    loadingTodayPractice,
    generatingPractice,
    handleGenerateDailyPractice,
    practiceHistoryLink,
  } = useDailyPractice(id);

  return (
    <Card
      title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📝 今日练习</span>}
      loading={loadingTodayPractice}
      extra={<Link to={practiceHistoryLink}>查看历史 →</Link>}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {todayPractice?.session ? (
        <div>
          {renderPracticeStats(todayPractice.session)}
          <div style={infoStyle}>
            <span style={{ marginRight: '8px' }}>🕐</span>
            创建时间：{fmtTime(todayPractice.session.create_time)}
          </div>
        </div>
      ) : todayPractice && ['pending', 'running'].includes(todayPractice.status) ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 0',
            background: '#fafafa',
            borderRadius: '8px',
          }}
        >
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
        <div
          style={{
            textAlign: 'center',
            padding: '50px 0',
            background: '#fafafa',
            borderRadius: '8px',
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#999', fontSize: '14px' }}>今日还未生成练习</span>}
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
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              }}
            >
              生成今日练习
            </Button>
          </Empty>
        </div>
      )}
    </Card>
  );
}

function renderPracticeStats(session: DailyPracticeSession) {
  return (
    <StatisticCard.Group direction="row">
      <StatisticCard
        statistic={{
          title: '总题数',
          value: session.total_questions,
          suffix: '题',
          icon: renderIcon('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '📋'),
        }}
        style={{ borderRadius: '8px' }}
      />
      <StatisticCard
        statistic={{
          title: '已完成',
          value: session.correct_questions,
          suffix: '题',
          valueStyle: { color: '#52c41a' },
          icon: renderIcon('linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', '✅'),
        }}
        style={{ borderRadius: '8px' }}
      />
      <StatisticCard
        statistic={{
          title: '得分',
          value: session.score.toFixed(1),
          suffix: '分',
          valueStyle: { color: '#1890ff' },
          icon: renderIcon('linear-gradient(135deg, #fa709a 0%, #fee140 100%)', '⭐'),
        }}
        style={{ borderRadius: '8px' }}
      />
      <StatisticCard
        statistic={{
          title: '状态',
          value: session.status === 'completed' ? '已完成' : '进行中',
          valueStyle: {
            color: session.status === 'completed' ? '#52c41a' : '#faad14',
            fontSize: '16px',
          },
          icon: renderIcon(
            session.status === 'completed'
              ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
              : 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            session.status === 'completed' ? '🎉' : '⏳',
          ),
        }}
        style={{ borderRadius: '8px' }}
      />
    </StatisticCard.Group>
  );
}

function renderIcon(background: string, content: string) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '8px',
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#fff',
      }}
    >
      {content}
    </div>
  );
}

const infoStyle: CSSProperties = {
  marginTop: 16,
  padding: '12px 16px',
  background: '#fafafa',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#666',
};


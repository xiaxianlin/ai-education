import type { CSSProperties } from 'react';
import { Card, Empty, Button, Space } from 'antd';
import { Link } from '@umijs/max';
import { StatisticCard } from '@ant-design/pro-components';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import { useDailyPractice } from '../hooks/useDailyPractice';
import { StudentApi } from '@/services/student';
import { fmtTime } from '@/utils/time';
import { generateWithConfirm } from '@/hooks/useGenerateWithConfirm';

type PracticeCardProps = {
  id: string;
};

export function PracticeCard({ id }: PracticeCardProps) {
  const {
    todaySession,
    loadingTodayPractice,
    handleGenerateDailyPractice,
    practiceHistoryLink,
    refreshTodayPractice,
  } = useDailyPractice(id);

  const handleRegenerate = () => {
    if (!todaySession) return;
    
    generateWithConfirm(
      async () => {
        return await StudentApi.regenerateDailyPractice(id, todaySession.session_id);
      },
      {
        confirmTitle: '确认重新生成',
        confirmIcon: <ExclamationCircleOutlined />,
        confirmContent: '重新生成将重置全部进度，此操作不可恢复。确定要继续吗？',
        loadingTitle: '正在重新生成每日练习',
        loadingContent: '重新生成中，请稍候...',
        successTitle: '重新生成成功',
        successContent: '每日练习已重新生成完成！',
        errorTitle: '重新生成失败',
        onSuccess: () => {
          refreshTodayPractice();
        },
      },
    );
  };

  return (
    <Card
      title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📝 每日练习</span>}
      loading={loadingTodayPractice}
      extra={<Link to={practiceHistoryLink}>查看历史 →</Link>}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {todaySession ? (
        // 已生成今日练习
        <div>
          {renderPracticeStats(todaySession)}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Space>
              <Link to={`/practice/detail/${todaySession.session_id}`}>
                <Button type="primary">查看练习详情 →</Button>
              </Link>
              {todaySession.status !== 2 && (
                <Button danger onClick={handleRegenerate}>
                  重新生成
                </Button>
              )}
            </Space>
          </div>
        </div>
      ) : (
        // 未生成今日练习
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
            description={<span style={{ color: '#999', fontSize: '14px' }}>今天还未生成练习</span>}
          >
            <Button
              type="primary"
              size="large"
              onClick={handleGenerateDailyPractice}
              style={{
                height: '40px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              }}
            >
              生成每日练习
            </Button>
          </Empty>
        </div>
      )}
    </Card>
  );
}

function renderPracticeStats(session: any) {
  const isCompleted = session.status === 2 || session.status === 'completed';
  const totalQuestions = session.question_count || session.total_questions || 0;
  const correctQuestions = session.correct_count || session.correct_questions || 0;
  const answeredCount = session.answer_count || 0;
  const score = session.score || 0;

  return (
    <StatisticCard.Group direction="row">
      <StatisticCard
        statistic={{
          title: '总题数',
          value: totalQuestions,
          suffix: '题',
          icon: renderIcon('linear-gradient(135deg, #667eea 0%, #764ba2 100%)', '📋'),
        }}
        style={{ borderRadius: '8px' }}
      />
      <StatisticCard
        statistic={{
          title: '已完成',
          value: answeredCount,
          suffix: '题',
          valueStyle: { color: '#52c41a' },
          icon: renderIcon('linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', '✅'),
        }}
        style={{ borderRadius: '8px' }}
      />
      <StatisticCard
        statistic={{
          title: '正确',
          value: correctQuestions,
          suffix: '题',
          valueStyle: { color: '#1890ff' },
          icon: renderIcon('linear-gradient(135deg, #fa709a 0%, #fee140 100%)', '⭐'),
        }}
        style={{ borderRadius: '8px' }}
      />
      <StatisticCard
        statistic={{
          title: '状态',
          value: isCompleted ? '已完成' : answeredCount > 0 ? '进行中' : '未开始',
          valueStyle: {
            color: isCompleted ? '#52c41a' : answeredCount > 0 ? '#faad14' : '#999',
            fontSize: '16px',
          },
          icon: renderIcon(
            isCompleted
              ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
              : answeredCount > 0
              ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
              : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
            isCompleted ? '🎉' : answeredCount > 0 ? '⏳' : '📝',
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

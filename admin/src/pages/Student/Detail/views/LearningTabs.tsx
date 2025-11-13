import { useMemo } from 'react';
import { Card, Col, Row, Space, Tabs, Tag, Button } from 'antd';
import { ProTable, StatisticCard } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';

import { useLearningData } from '../hooks/useLearningData';

const { Statistic } = StatisticCard;

type LearningTabsProps = {
  id: string;
};

export function LearningTabs({ id }: LearningTabsProps) {
  const {
    activeTab,
    setActiveTab,
    stats,
    loadingStats,
    records,
    loadingRecords,
    wrongQuestions,
    loadingWrongQuestions,
    handleMarkAsMastered,
    handleUnmarkAsMastered,
    marking,
    unmarking,
  } = useLearningData(id);

  const recordColumns = useMemo<ProColumns<StudyRecord>[]>(() => {
    return [
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
  }, []);

  const wrongQuestionColumns = useMemo<ProColumns<StudentWrongQuestion>[]>(() => {
    return [
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
                type="link"
                size="small"
                loading={marking}
                onClick={() => handleMarkAsMastered(record.question_id)}
              >
                标记掌握
              </Button>
            ) : (
              <Button
                type="link"
                size="small"
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
  }, [handleMarkAsMastered, handleUnmarkAsMastered, marking, unmarking]);

  const tabItems = useMemo(
    () => [
      {
        key: 'stats',
        label: '学习统计',
        children: (
          <Card loading={loadingStats}>
            {stats ? (
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic title="练习次数" value={stats.total_practice} prefix="📚" />
                </Col>
                <Col span={6}>
                  <Statistic title="完成题目" value={stats.total_questions} prefix="✏️" />
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
                  <Statistic title="连续天数" value={stats.current_streak} prefix="🔥" />
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
    ],
    [
      loadingStats,
      stats,
      recordColumns,
      records,
      loadingRecords,
      wrongQuestionColumns,
      wrongQuestions,
      loadingWrongQuestions,
    ],
  );

  return <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />;
}


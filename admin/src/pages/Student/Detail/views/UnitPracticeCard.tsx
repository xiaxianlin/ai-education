import { Card, Empty, Tag, Button, Space } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { useMemo } from 'react';
import { fmtTime } from '@/utils/time';

import { useUnitPractice } from '../hooks/useUnitPractice';

type UnitPracticeCardProps = {
  id: string;
};

export function UnitPracticeCard({ id }: UnitPracticeCardProps) {
  const { unitPractices, loading } = useUnitPractice(id);

  const columns = useMemo<ProColumns<UnitPracticeSession>[]>(
    () => [
      {
        title: '单元ID',
        dataIndex: 'unit_id',
        width: 100,
      },
      {
        title: '总题数',
        dataIndex: 'total_questions',
        width: 100,
        render: (value) => `${value} 题`,
      },
      {
        title: '正确题数',
        dataIndex: 'correct_questions',
        width: 100,
        render: (value) => `${value} 题`,
      },
      {
        title: '准确率',
        dataIndex: 'accuracy',
        width: 100,
        render: (_, record) => {
          const accuracy =
            record.total_questions > 0
              ? ((record.correct_questions / record.total_questions) * 100).toFixed(1)
              : '0';
          return `${accuracy}%`;
        },
      },
      {
        title: '得分',
        dataIndex: 'score',
        width: 100,
        render: (score: number) => score.toFixed(1),
      },
      {
        title: '难度',
        dataIndex: 'difficulty',
        width: 100,
        render: (difficulty: string) => {
          const difficultyMap: Record<string, { text: string; color: string }> = {
            easy: { text: '简单', color: 'green' },
            medium: { text: '中等', color: 'orange' },
            hard: { text: '困难', color: 'red' },
            adaptive: { text: '自适应', color: 'blue' },
          };
          const config = difficultyMap[difficulty] || { text: difficulty, color: 'default' };
          return <Tag color={config.color}>{config.text}</Tag>;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: string) => (
          <Tag color={status === 'completed' ? 'success' : 'warning'}>
            {status === 'completed' ? '已完成' : '进行中'}
          </Tag>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        width: 180,
        renderText: (time: number) => fmtTime(time),
      },
      {
        title: '操作',
        valueType: 'option',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <Link to={`/student/${id}/practice/unit/${record.id}`}>
            <Button type="link" size="small">
              查看详情
            </Button>
          </Link>
        ),
      },
    ],
    [id],
  );

  return (
    <Card
      title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📚 单元练习</span>}
      loading={loading}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {unitPractices.length > 0 ? (
        <ProTable<UnitPracticeSession>
          rowKey="id"
          columns={columns}
          search={false}
          pagination={false}
          dataSource={unitPractices}
          loading={loading}
          options={false}
          toolbar={{ actions: [] }}
          scroll={{ x: 'max-content' }}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#999', fontSize: '14px' }}>暂无单元练习记录</span>}
          style={{ padding: '40px 0' }}
        />
      )}
    </Card>
  );
}


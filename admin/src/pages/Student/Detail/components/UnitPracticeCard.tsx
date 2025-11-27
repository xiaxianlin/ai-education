import { Card, Empty, Tag, Button, Space, Modal, message } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { useMemo } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { fmtTime } from '@/utils/time';

import { useUnitPractice } from '../hooks/useUnitPractice';
import { StudentApi } from '@/services/student';

type UnitPracticeCardProps = {
  id: string;
};

export function UnitPracticeCard({ id }: UnitPracticeCardProps) {
  const { unitPractices, loading, refresh } = useUnitPractice(id);

  const handleRegenerate = async (session: UnitPracticeSession) => {
    if (!session.unit_id) {
      message.error('单元ID不存在');
      return;
    }
    Modal.confirm({
      title: '确认重新生成',
      icon: <ExclamationCircleOutlined />,
      content: '重新生成将重置全部进度，此操作不可恢复。确定要继续吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await StudentApi.regenerateUnitPractice(id, session.unit_id!);
          message.success('重新生成成功');
          refresh();
        } catch (error) {
          message.error('重新生成失败');
        }
      },
    });
  };

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
        render: (status: string | number) => {
          const statusNum = typeof status === 'number' ? status : status === 'completed' ? 2 : status === 'in_progress' ? 1 : 0;
          const isCompleted = statusNum === 2;
          return (
            <Tag color={isCompleted ? 'success' : statusNum === 1 ? 'warning' : 'default'}>
              {isCompleted ? '已完成' : statusNum === 1 ? '进行中' : '未开始'}
            </Tag>
          );
        },
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
        width: 180,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Link to={`/practice/detail/${record.session_id}`}>
              <Button type="link" size="small">
                查看详情
              </Button>
            </Link>
            {(record.status === 'in_progress' || record.status === 1) && (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleRegenerate(record)}
              >
                重新生成
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [id, handleRegenerate],
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
          rowKey="session_id"
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


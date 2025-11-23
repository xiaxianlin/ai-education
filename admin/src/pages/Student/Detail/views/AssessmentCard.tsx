import { Card, Empty, Tag, Button, Space, Modal, message } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { useMemo } from 'react';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { fmtTime } from '@/utils/time';

import { useAssessment } from '../hooks/useAssessment';
import { StudentApi } from '@/services/student';

type AssessmentCardProps = {
  id: string;
};

export function AssessmentCard({ id }: AssessmentCardProps) {
  const { assessments, loading, refresh } = useAssessment(id);

  const handleReset = async (assessment: AssessmentTest) => {
    Modal.confirm({
      title: '确认重新生成',
      icon: <ExclamationCircleOutlined />,
      content: '重新生成将清除全部进度和已答题目，此操作不可恢复。确定要继续吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await StudentApi.regenerateAssessment(id);
          message.success('重新生成成功');
          refresh();
        } catch (error) {
          message.error('重新生成失败');
        }
      },
    });
  };

  const columns = useMemo<ProColumns<AssessmentTest>[]>(
    () => [
      {
        title: '评测类型',
        dataIndex: 'assessment_type',
        width: 120,
        render: (type: string) => {
          const typeMap: Record<string, { text: string; color: string }> = {
            unit: { text: '单元评测', color: 'blue' },
            comprehensive: { text: '综合评测', color: 'purple' },
            topic: { text: '专题评测', color: 'cyan' },
          };
          const config = typeMap[type] || { text: type, color: 'default' };
          return <Tag color={config.color}>{config.text}</Tag>;
        },
      },
      {
        title: '目标ID',
        dataIndex: 'target_id',
        width: 100,
        render: (targetId: number | null) => targetId || '-',
      },
      {
        title: '已答题数',
        dataIndex: 'answered_count',
        width: 100,
        render: (value) => `${value} 题`,
      },
      {
        title: '能力值',
        dataIndex: 'current_ability',
        width: 100,
        render: (ability: number) => ability.toFixed(2),
      },
      {
        title: '能力等级',
        dataIndex: 'ability_level',
        width: 100,
        render: (level: string) => {
          const levelMap: Record<string, { text: string; color: string }> = {
            beginner: { text: '初级', color: 'green' },
            intermediate: { text: '中级', color: 'orange' },
            advanced: { text: '高级', color: 'red' },
          };
          const config = levelMap[level] || { text: level || '-', color: 'default' };
          return <Tag color={config.color}>{config.text}</Tag>;
        },
      },
      {
        title: '总分',
        dataIndex: 'overall_score',
        width: 100,
        render: (score: number) => score.toFixed(1),
      },
      {
        title: '置信度',
        dataIndex: 'confidence',
        width: 100,
        render: (confidence: number) => `${(confidence * 100).toFixed(1)}%`,
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
            <Link to={`/student/${id}/practice/assessment/${record.session_id}`}>
              <Button type="link" size="small">
                查看详情
              </Button>
            </Link>
            {(record.status === 'in_progress' || record.status === 1) && (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleReset(record)}
              >
                重新生成
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [id, handleReset],
  );

  return (
    <Card
      title={<span style={{ fontSize: '16px', fontWeight: 600 }}>🎯 能力评估</span>}
      loading={loading}
      style={{
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {assessments.length > 0 ? (
        <ProTable<AssessmentTest>
          rowKey="id"
          columns={columns}
          search={false}
          pagination={false}
          dataSource={assessments}
          loading={loading}
          options={false}
          toolbar={{ actions: [] }}
          scroll={{ x: 'max-content' }}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ color: '#999', fontSize: '14px' }}>暂无能力评估记录</span>}
          style={{ padding: '40px 0' }}
        />
      )}
    </Card>
  );
}


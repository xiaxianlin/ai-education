import { useParams, history, Link } from '@umijs/max';
import { PageContainer, ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { StudentApi } from '@/services/student';
import { useRequest } from 'ahooks';
import { message, Button, Modal, Tag, Space, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useMemo, useRef, useState } from 'react';
import { fmtTime } from '@/utils/time';
import type { PracticeSession } from '@/services/practice';

type PracticeType = 'daily_practice' | 'unit_practice' | 'assessment';

export default function PracticeHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [practiceType, setPracticeType] = useState<PracticeType>('daily_practice');
  const actionRef = useRef<ActionType>();

  const { data, loading, refresh } = useRequest(
    () => StudentApi.getPracticeHistory(id!, practiceType),
    {
      ready: !!id,
      refreshDeps: [practiceType],
      onError: () => {
        message.error('加载历史记录失败');
      },
    },
  );

  // 删除练习（如果后端支持）
  const { runAsync: handleDelete, loading: deleting } = useRequest(
    async (sessionId: number) => {
      await StudentApi.deleteDailyPractice(id!, sessionId);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('删除成功');
        refresh();
        actionRef.current?.reload();
      },
      onError: () => {
        message.error('删除失败');
      },
    },
  );

  const handleDeleteClick = (practice: PracticeSession) => {
    let content = '确定要删除这条练习记录吗？此操作不可恢复。';
    if (practice.session_type === 'daily_practice' && practice.target_id) {
      const dateStr = String(practice.target_id);
      const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
      content = `确定要删除 ${formattedDate} 的日常练习记录吗？此操作不可恢复。`;
    }
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content,
      okType: 'danger',
      onOk: () => handleDelete(practice.session_id),
    });
  };

  const getPracticeTypeLabel = (type: PracticeType) => {
    switch (type) {
      case 'daily_practice':
        return '每日练习';
      case 'unit_practice':
        return '单元练习';
      case 'assessment':
        return '能力评估';
      default:
        return '练习';
    }
  };

  const getPracticeTypePath = (type: PracticeType) => {
    switch (type) {
      case 'daily_practice':
        return 'daily';
      case 'unit_practice':
        return 'unit';
      case 'assessment':
        return 'assessment';
      default:
        return 'daily';
    }
  };

  const columns = useMemo<ProColumns<PracticeSession>[]>(
    () => [
      {
        title: practiceType === 'daily_practice' ? '日期' : practiceType === 'unit_practice' ? '单元ID' : '目标ID',
        dataIndex: 'target_id',
        width: 120,
        render: (targetId: number | undefined, record) => {
          if (practiceType === 'daily_practice' && targetId) {
            const dateStr = String(targetId);
            return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
          }
          return targetId || '-';
        },
      },
      {
        title: '总题数',
        dataIndex: 'question_count',
        width: 100,
        render: (value) => `${value} 题`,
      },
      {
        title: '已答题数',
        dataIndex: 'answer_count',
        width: 100,
        render: (value) => `${value} 题`,
      },
      {
        title: '正确题数',
        dataIndex: 'correct_count',
        width: 100,
        render: (value) => `${value} 题`,
      },
      {
        title: '准确率',
        width: 100,
        render: (_, record) => {
          const accuracy =
            record.question_count > 0
              ? ((record.correct_count / record.question_count) * 100).toFixed(1)
              : '0';
          return `${accuracy}%`;
        },
      },
      ...(practiceType === 'assessment'
        ? [
            {
              title: '能力值',
              dataIndex: 'current_ability',
              width: 100,
              render: (ability: number | undefined) => (ability ? ability.toFixed(2) : '-'),
            },
            {
              title: '能力等级',
              dataIndex: 'ability_level',
              width: 100,
              render: (level: string | undefined) => {
                const levelMap: Record<string, { text: string; color: string }> = {
                  beginner: { text: '初级', color: 'green' },
                  intermediate: { text: '中级', color: 'orange' },
                  advanced: { text: '高级', color: 'red' },
                };
                const config = levelMap[level || ''] || { text: level || '-', color: 'default' };
                return <Tag color={config.color}>{config.text}</Tag>;
              },
            },
          ]
        : []),
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: (status: number) => {
          const isCompleted = status === 2;
          return (
            <Tag color={isCompleted ? 'success' : status === 1 ? 'warning' : 'default'}>
              {isCompleted ? '已完成' : status === 1 ? '进行中' : '未开始'}
            </Tag>
          );
        },
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        width: 180,
        renderText: (time: number | undefined) => (time ? fmtTime(time) : '-'),
      },
      {
        title: '操作',
        valueType: 'option',
        width: 150,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Link to={`/student/${id}/practice/${getPracticeTypePath(practiceType)}/${record.session_id}`}>
              <Button size="small" type="link">
                查看详情
              </Button>
            </Link>
            {practiceType === 'daily_practice' && (
              <Button size="small" type="link" danger onClick={() => handleDeleteClick(record)}>
                删除
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [id, practiceType],
  );

  return (
    <PageContainer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
            style={{ padding: 0, height: 'auto' }}
          />
          <span>练习历史</span>
        </div>
      }
      className="simple-list-page"
      header={{
        breadcrumb: {},
      }}
    >
      <Tabs
        activeKey={practiceType}
        onChange={(key) => setPracticeType(key as PracticeType)}
        items={[
          {
            key: 'daily_practice',
            label: '每日练习',
          },
          {
            key: 'unit_practice',
            label: '单元练习',
          },
          {
            key: 'assessment',
            label: '能力评估',
          },
        ]}
        style={{ marginBottom: 16 }}
      />
      <ProTable<PracticeSession>
        style={{ marginTop: 16 }}
        actionRef={actionRef}
        rowKey="session_id"
        columns={columns}
        search={false}
        dataSource={data || []}
        loading={loading || deleting}
        options={false}
        toolbar={{ actions: [] }}
        scroll={{ x: 'max-content' }}
      />
    </PageContainer>
  );
}

import { useParams, history } from '@umijs/max';
import { PageContainer, ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { StudentApi } from '@/services/student';
import { useRequest } from 'ahooks';
import { message, Button, Modal, Tag } from 'antd';
import { useMemo, useRef } from 'react';
import { fmtTime } from '@/utils/time';

export default function PracticeHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const actionRef = useRef<ActionType>();

  const { data, loading, refresh } = useRequest(() => StudentApi.getDailyPractices(id!, 100), {
    ready: !!id,
    onError: () => {
      message.error('加载历史记录失败');
    },
  });

  // 删除日常练习
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

  const handleDeleteClick = (practice: DailyPracticeSession) => {
    const dateStr = String(practice.date);
    const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除 ${formattedDate} 的日常练习记录吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: () => handleDelete(practice.id),
    });
  };

  const columns = useMemo<ProColumns<DailyPracticeSession>[]>(
    () => [
      {
        title: '日期',
        dataIndex: 'date',
        width: 120,
        render: (date: number) => {
          const dateStr = String(date);
          return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
        },
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
          <Button size="small" type="link" danger onClick={() => handleDeleteClick(record)}>
            删除
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer
      title="日常练习历史"
      className="simple-list-page"
      header={{
        extra: [
          <Button key="back" onClick={() => history.back()}>
            返回
          </Button>,
        ],
      }}
    >
      <ProTable<DailyPracticeSession>
        style={{ marginTop: 16 }}
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={false}
        dataSource={data?.data || []}
        loading={loading || deleting}
        options={false}
        toolbar={{ actions: [] }}
        scroll={{ x: 'max-content' }}
      />
    </PageContainer>
  );
}

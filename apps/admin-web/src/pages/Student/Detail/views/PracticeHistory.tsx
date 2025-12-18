import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Card } from 'antd';
import { Link } from 'react-router-dom';
import { useRef, useMemo, useState } from 'react';
import { formatDateTime } from '@ai-education/shared-web';
import { DeleteButton } from '@/components/DeleteButton';
import { useStudentDetailModel } from '../models/page';
import { adminApi } from '@/lib/api';
import { PRACTICE_TYPE_LABELS } from '@/constants/practice';
import { useRequest } from 'ahooks';
import { GRADES } from '@/constants/course';

export function PracticeHistory() {
  const actionRef = useRef<ActionType>();
  const { student } = useStudentDetailModel();
  const [practiceType, setPracticeType] = useState<PracticeType>('daily_practice');

  // 删除功能
  const { runAsync: handleDelete, loading: deleteLoading } = useRequest(
    (sessionId: number) => adminApi.removePracticeSession(sessionId),
    { manual: true, onSuccess: () => actionRef.current?.reload() },
  );

  const columns = useMemo<ProColumns<PracticeSession>[]>(
    () => [
      {
        title: '目标ID',
        dataIndex: 'target_id',
        width: 120,
        renderText: (targetId: number | undefined, record) => {
          if (record.session_type === 'daily_practice' && targetId) {
            const dateStr = String(targetId);
            return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
          }
          return targetId || '-';
        },
      },
      {
        title: '教材',
        dataIndex: 'textbook',
        width: 200,
        renderText: (textbook: Textbook) =>
          `${textbook.subject} | ${textbook.version} | ${GRADES[textbook.grade]} | ${textbook.semester}`,
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
            record.question_count > 0 ? ((record.correct_count / record.question_count) * 100).toFixed(1) : '0';
          return `${accuracy}%`;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        renderText: (status: number) => {
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
        renderText: (time: number | undefined) => (time ? formatDateTime(time) : '-'),
      },
      {
        title: '操作',
        valueType: 'option',
        width: 200,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Link to={`/practice/detail/${record.id}`}>
              <Button size="small" type="link">
                查看详情
              </Button>
            </Link>
            <DeleteButton
              onConfirm={() => handleDelete(record.id)}
              title="确定要删除这条练习记录吗？"
              description={`删除后无法恢复，请谨慎操作。练习类型：${PRACTICE_TYPE_LABELS[record.session_type]}`}
              buttonText="删除"
              buttonProps={{ loading: deleteLoading }}
            />
          </Space>
        ),
      },
    ],
    [practiceType],
  );

  return (
    <Card
      activeTabKey={practiceType}
      onTabChange={(key) => {
        setPracticeType(key as PracticeType);
        actionRef.current?.reload();
      }}
      tabList={[
        { key: 'daily_practice', label: '每日练习' },
        { key: 'unit_practice', label: '单元练习' },
        { key: 'assessment', label: '能力评估' },
      ]}
    >
      <ProTable<PracticeSession>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={false}
        toolbar={{ settings: [] }}
        request={async () => {
          const res = await adminApi.getPracticeHistory(student?.id || '', practiceType);
          return { data: res || [], success: true, total: res.length || 0 };
        }}
        scroll={{ x: 'max-content' }}
        pagination={{ defaultPageSize: 10 }}
      />
    </Card>
  );
}

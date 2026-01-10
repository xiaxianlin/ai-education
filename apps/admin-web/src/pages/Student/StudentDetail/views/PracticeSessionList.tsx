import { createActionColumn, createStatusColumn, createTimeColumn } from '@/hooks';
import { GRADES } from '@ai-education/shared-web';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { StudentApi } from '../../api';
import { useStudentDetailModel } from '../models/page';

export function PracticeSessionList() {
  const { student } = useStudentDetailModel();
  const tableActionRef = useRef<ActionType>();

  const columns = useMemo<ProColumns<Practice>[]>(
    () => [
      {
        title: '目标ID',
        dataIndex: 'target_id',
        width: 120,
      },
      {
        title: '教材',
        dataIndex: 'textbook',
        width: 200,
        renderText: (textbook: Textbook) =>
          textbook
            ? `${textbook.subject} | ${textbook.version} | ${GRADES[textbook.grade]} | ${textbook.semester}`
            : '-',
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
      createStatusColumn<Practice>('状态', 'status', {
        width: 100,
        render: (status) => {
          const isCompleted = status === 2;
          return (
            <Tag color={isCompleted ? 'success' : status === 1 ? 'warning' : 'default'}>
              {isCompleted ? '已完成' : status === 1 ? '进行中' : '未开始'}
            </Tag>
          );
        },
      }),
      createTimeColumn<Practice>('创建时间', 'create_time', { width: 180 }),
      createActionColumn<Practice>(
        (record) => (
          <Link to={`/student/${student?.id}/practice/${record.id}`}>
            <Button size="small" type="link">
              详情
            </Button>
          </Link>
        ),
        { width: 120 },
      ),
    ],
    [student?.id],
  );

  return (
    <ProTable<Practice>
      actionRef={tableActionRef}
      bordered
      rowKey="id"
      columns={columns}
      search={false}
      request={async ({ pageSize, current }) => {
        const res = await StudentApi.getStudentPracticeSessions(student?.id || '', 'daily_practice', {
          page: current || 1,
          page_size: pageSize || 20,
        });
        return {
          data: res.data || [],
          success: true,
          total: res.total || 0,
        };
      }}
      scroll={{ x: 'max-content' }}
      pagination={{
        defaultPageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
      }}
      toolbar={{ settings: [] }}
    />
  );
}

import { PageHeader } from '@/components';
import { GRADES } from '@/constants/course';
import { createActionColumn, createStatusColumn, createTimeColumn } from '@/hooks';
import { ActionType, PageContainer, ProColumns, ProSkeleton, ProTable } from '@ant-design/pro-components';
import { Button, Card, Empty, Tag } from 'antd';
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { StudentApi } from '../../api';
import { usePracticeSessionListModel } from '../models/PageModel';

export function Main() {
  const { student, studentId, studentLoading, studentError, practiceService, practiceId, setPracticeId } =
    usePracticeSessionListModel();
  const tableActionRef = useRef<ActionType>();

  const { data: practices = [], loading: practicesLoading } = practiceService;

  const columns = useMemo<ProColumns<PracticeSession>[]>(
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
      createStatusColumn<PracticeSession>('状态', 'status', {
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
      createTimeColumn<PracticeSession>('创建时间', 'create_time', { width: 180 }),
      createActionColumn<PracticeSession>(
        (record) => (
          <Link to={`/student/${studentId}/practice_session/${record.id}`}>
            <Button size="small" type="link">
              详情
            </Button>
          </Link>
        ),
        { width: 120 },
      ),
    ],
    [practiceId, practices, studentId],
  );

  useEffect(() => {
    if (!practices.length) return;
    if (!practiceId || !practices.map((i) => i.id).includes(practiceId)) {
      setPracticeId(practices[0].id);
    }
  }, [practices, practiceId]);

  if (studentLoading) {
    return (
      <PageContainer title={<PageHeader title="练习会话列表" />}>
        <ProSkeleton type="descriptions" />
      </PageContainer>
    );
  }

  if (studentError || !student) {
    return (
      <PageContainer title={<PageHeader title="练习会话列表" />}>
        <Empty description={studentError ? '加载失败' : '学生不存在'} />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={<PageHeader title={`${student.name} - 练习会话列表`} />}>
      <Card
        loading={practicesLoading}
        activeTabKey={practiceId?.toString() || ''}
        onTabChange={(key) => {
          setPracticeId(Number(key));
          tableActionRef.current?.reload();
        }}
        tabList={practices.map((practice) => ({ key: practice.id.toString(), label: practice.name }))}
        styles={{ body: { padding: 0, paddingTop: 16 } }}
      >
        <ProTable<PracticeSession>
          actionRef={tableActionRef}
          bordered
          rowKey="id"
          columns={columns}
          search={false}
          request={async () => {
            const res = await StudentApi.getStudentPracticeSessions(studentId || '', practiceId || 0);
            return { data: res || [], success: true, total: res.length || 0 };
          }}
          scroll={{ x: 'max-content' }}
          pagination={false}
          toolbar={{ settings: [] }}
        />
      </Card>
    </PageContainer>
  );
}

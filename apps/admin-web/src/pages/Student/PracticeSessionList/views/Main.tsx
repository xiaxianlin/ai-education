import { createActionColumn, createStatusColumn, createTimeColumn } from '@/hooks';
import { GRADES } from '@ai-education/shared-web';
import { ActionType, PageContainer, ProColumns, ProSkeleton, ProTable } from '@ant-design/pro-components';
import { Button, Card, Empty, Tag } from 'antd';
import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StudentApi } from '../../api';
import { usePracticeSessionListModel } from '../models/PageModel';
;

export function Main() {
  const navigate = useNavigate();
  const { student, studentId, studentLoading, studentError, practices, practiceSlug, setPracticeSlug } =
    usePracticeSessionListModel();
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
          <Link to={`/student/${studentId}/practice/${record.id}`}>
            <Button size="small" type="link">
              详情
            </Button>
          </Link>
        ),
        { width: 120 },
      ),
    ],
    [practiceSlug, practices, studentId],
  );

  if (studentLoading) {
    return (
      <PageContainer title="练习会话列表" header={{ onBack: () => navigate(-1) }}>
        <ProSkeleton type="descriptions" />
      </PageContainer>
    );
  }

  if (studentError || !student) {
    return (
      <PageContainer title="练习会话列表" header={{ onBack: () => navigate(-1) }}>
        <Empty description={studentError ? '加载失败' : '学生不存在'} />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`${student.name} - 练习会话列表`} header={{ onBack: () => navigate(-1) }}>
      <Card
        activeTabKey={practiceSlug || ''}
        onTabChange={(key) => {
          setPracticeSlug(key);
          tableActionRef.current?.reload();
        }}
        tabList={practices.map((practice) => ({ key: practice.slug, label: practice.name }))}
        styles={{ body: { padding: 0, paddingTop: 16 } }}
      >
        <ProTable<Practice>
          actionRef={tableActionRef}
          bordered
          rowKey="id"
          columns={columns}
          search={false}
          request={async () => {
            const res = await StudentApi.getStudentPracticeSessions(studentId || '', practiceSlug || 'daily_practice');
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

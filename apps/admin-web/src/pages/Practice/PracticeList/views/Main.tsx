import { createActionColumn, createStatusColumn, createTimeColumn } from '@/hooks';
import { GRADES } from '@ai-education/shared-web';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Card, Tag } from 'antd';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PracticeApi } from '../../api';
import { usePracticeListModel } from '../models/page';
import { GENERATE_STATUS_CONFIG, PRACTICE_STATUS_CONFIG, PRACTICE_TYPE_CONFIG } from '../utils';

export default function MainView() {
  const { actionRef, practiceType, practiceTypes, handleTabChange, handleViewDetail } = usePracticeListModel();

  const columns = useMemo<ProColumns<Practice>[]>(
    () => [
      {
        title: '练习ID',
        dataIndex: 'id',
        width: 280,
        ellipsis: true,
        copyable: true,
      },
      {
        title: '练习类型',
        dataIndex: 'practice_type',
        width: 120,
        render: (_, record) => {
          const config = PRACTICE_TYPE_CONFIG[record.practice_type] || {
            label: record.practice_type,
            color: 'default',
          };
          return <Tag color={config.color}>{config.label}</Tag>;
        },
      },
      {
        title: '学生',
        dataIndex: ['student', 'name'],
        width: 120,
        render: (_, record) =>
          record.student ? (
            <Link to={`/student/detail/${record.student_id}`}>{record.student.name}</Link>
          ) : (
            record.student_id
          ),
      },
      {
        title: '科目',
        dataIndex: 'subject',
        width: 80,
        render: (text) => text || '-',
      },
      {
        title: '年级',
        dataIndex: 'grade',
        width: 100,
        render: (_, record) => (record.grade ? GRADES[record.grade] : '-'),
      },
      {
        title: '总题数',
        dataIndex: 'question_count',
        width: 80,
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
        title: '正确率',
        width: 80,
        render: (_, record) => {
          if (record.answer_count === 0) return '-';
          const rate = ((record.correct_count / record.answer_count) * 100).toFixed(1);
          return `${rate}%`;
        },
      },
      createStatusColumn<Practice>('状态', 'status', {
        width: 100,
        render: (status) => {
          const config = PRACTICE_STATUS_CONFIG[status as PracticeStatus] || {
            label: '未知',
            color: 'default',
          };
          return <Tag color={config.color}>{config.label}</Tag>;
        },
      }),
      {
        title: '生成状态',
        dataIndex: 'generate_status',
        width: 100,
        render: (status) => {
          const config = GENERATE_STATUS_CONFIG[status as PracticeGenerateStatus] || {
            label: '未知',
            color: 'default',
          };
          return <Tag color={config.color}>{config.label}</Tag>;
        },
      },
      createTimeColumn<Practice>('创建时间', 'create_time', { width: 180 }),
      createActionColumn<Practice>(
        (record) => (
          <Button size="small" type="link" onClick={() => handleViewDetail(record.id)}>
            详情
          </Button>
        ),
        { width: 80 },
      ),
    ],
    [handleViewDetail],
  );

  return (
    <PageContainer title="练习管理" header={{ breadcrumb: {} }}>
      <Card
        activeTabKey={practiceType}
        onTabChange={handleTabChange}
        tabList={practiceTypes.map((item) => ({ key: item.key, label: item.label }))}
        styles={{ body: { padding: 0, paddingTop: 16 } }}
      >
        <ProTable<Practice>
          actionRef={actionRef}
          bordered
          rowKey="id"
          columns={columns}
          search={false}
          request={async (params) => {
            const requestParams: SearchPracticeRequest = {
              page: params.current || 1,
              size: params.pageSize || 20,
            };
            if (practiceType !== 'all') {
              requestParams.practice_type = practiceType;
            }
            const res = await PracticeApi.searchPractices(requestParams);
            return {
              data: res?.data || [],
              success: true,
              total: res?.total || 0,
            };
          }}
          scroll={{ x: 'max-content' }}
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
          }}
          toolbar={{ settings: [] }}
        />
      </Card>
    </PageContainer>
  );
}

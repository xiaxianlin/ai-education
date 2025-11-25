import { PageContainer, ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Tag, Space, Tabs } from 'antd';
import { Link, useSearchParams } from '@umijs/max';
import { useRef, useMemo, useState } from 'react';
import { PracticeApi, type PracticeRecord } from '@/services/practice';
import { fmtTime } from '@/utils/time';
import { DeleteButton } from '@/components/business/DeleteButton';
import { useDelete } from '@/hooks/useDelete';

type PracticeType = 'daily_practice' | 'unit_practice' | 'assessment';

export default function PracticeListPage() {
  const actionRef = useRef<ActionType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = searchParams.get('student_id') || undefined;
  const [practiceType, setPracticeType] = useState<PracticeType | undefined>(undefined);

  // 删除功能
  const { handleDelete, loading: deleteLoading } = useDelete<number>(
    PracticeApi.deletePracticeRecord,
    {
      onSuccess: () => {
        actionRef.current?.reload();
      },
      successMessage: '删除成功',
      errorMessage: '删除失败',
    },
  );

  const getPracticeTypeLabel = (type: string) => {
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

  const getPracticeTypePath = (type: string) => {
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

  const columns = useMemo<ProColumns<PracticeRecord>[]>(
    () => [
      {
        title: '学生姓名',
        dataIndex: 'student_name',
        width: 120,
        fixed: 'left',
        render: (name: string, record) => (
          <Link to={`/student/detail/${record.student_id}`}>{name}</Link>
        ),
      },
      {
        title: '手机号',
        dataIndex: 'student_phone',
        width: 130,
      },
      {
        title: '练习类型',
        dataIndex: 'session_type',
        width: 100,
        render: (type: string) => <Tag>{getPracticeTypeLabel(type)}</Tag>,
      },
      {
        title: practiceType === 'daily_practice' ? '日期' : practiceType === 'unit_practice' ? '单元ID' : '目标ID',
        dataIndex: 'target_id',
        width: 120,
        render: (targetId: number | undefined, record) => {
          if (record.session_type === 'daily_practice' && targetId) {
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
        width: 200,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Link to={`/practice/detail/${record.session_id}`}>
              <Button size="small" type="link">
                查看详情
              </Button>
            </Link>
            <DeleteButton
              onConfirm={() => handleDelete(record.session_id)}
              title="确定要删除这条练习记录吗？"
              description={`删除后无法恢复，请谨慎操作。学生：${record.student_name}，练习类型：${getPracticeTypeLabel(record.session_type)}`}
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
    <PageContainer
      title="学生练习记录"
      className="simple-list-page"
      header={{
        breadcrumb: {},
      }}
    >
      {studentId && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f0f2f5', borderRadius: '4px' }}>
          当前筛选：学生ID = {studentId}
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSearchParams({});
              actionRef.current?.reload();
            }}
            style={{ marginLeft: 8 }}
          >
            清除筛选
          </Button>
        </div>
      )}
      <Tabs
        activeKey={practiceType || 'all'}
        onChange={(key) => {
          setPracticeType(key === 'all' ? undefined : (key as PracticeType));
          actionRef.current?.reload();
        }}
        items={[
          {
            key: 'all',
            label: '全部',
          },
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
      <ProTable<PracticeRecord>
        style={{ marginTop: 16 }}
        actionRef={actionRef}
        rowKey="session_id"
        columns={columns}
        search={false}
        request={async (params) => {
          const { current = 1, pageSize = 20 } = params;
          const res = await PracticeApi.getAllPracticeRecords({
            practice_type: practiceType,
            student_id: studentId,
            limit: pageSize,
            offset: (current - 1) * pageSize,
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
      />
    </PageContainer>
  );
}


import React from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { TaskApi } from '@/services/task';
import { fmtTime } from '@/utils/time';
import { Link } from '@umijs/max';
import { Space, Tag, Progress } from 'antd';

const statusConfig = {
  pending: { color: 'default', text: '待执行' },
  running: { color: 'processing', text: '执行中' },
  completed: { color: 'success', text: '已完成' },
  failed: { color: 'error', text: '失败' },
};

export default function TaskListPage() {
  const actionRef = React.useRef<any>();

  const columns: ProColumns<Task>[] = [
    {
      title: '任务ID',
      dataIndex: 'id',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '任务名称',
      dataIndex: 'task_name',
      ellipsis: true,
      minWidth: 200,
    },
    {
      title: '任务类型',
      dataIndex: 'task_type',
      width: 120,
      valueType: 'select',
      valueEnum: {
        generate_question: { text: '生成题目' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        pending: { text: '待执行' },
        running: { text: '执行中' },
        completed: { text: '已完成' },
        failed: { text: '失败' },
      },
      render: (_, record) => {
        const config = statusConfig[record.status];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      hideInSearch: true,
      render: (progress: number, record) => {
        if (record.status === 'pending') {
          return <Tag>0%</Tag>;
        }
        if (record.status === 'completed') {
          return <Tag color="success">100%</Tag>;
        }
        if (record.status === 'failed') {
          return <Tag color="error">失败</Tag>;
        }
        return (
          <Progress
            percent={progress}
            size="small"
            status={record.status === 'running' ? 'active' : 'normal'}
            style={{ minWidth: 80 }}
          />
        );
      },
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      width: 170,
      hideInSearch: true,
      renderText: (time) => (time ? fmtTime(time) : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      width: 170,
      hideInSearch: true,
      renderText: (time) => (time ? fmtTime(time) : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 170,
      hideInSearch: true,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '操作',
      key: 'option',
      fixed: 'right',
      hideInSearch: true,
      width: 100,
      render: (_, record) => (
        <Space>
          <Link className="umi-link" key="detail" to={`/task/detail/${record.id}`}>
            详情
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="任务管理" header={{ breadcrumb: {} }} className="simple-list-page">
      <ProTable<Task>
        bordered
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const searchParams: TaskSearchParams = {
            ...params,
            page: params.current || 1,
            size: params.pageSize || 10,
          };

          const res = await TaskApi.list(searchParams);
          return {
            data: res?.data || [],
            total: res?.total || 0,
            success: true,
          };
        }}
        search={{ labelWidth: 'auto', defaultFormItemsNumber: 3 }}
        options={false}
        toolbar={{ settings: [] }}
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 10 }}
        polling={3000} // 每3秒轮询一次，更新任务状态
      />
    </PageContainer>
  );
}

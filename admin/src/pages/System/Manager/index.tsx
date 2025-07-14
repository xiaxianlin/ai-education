import { ManagerStatus, ManagerType } from '@/constants/manager';
import { ManagerApi } from '@/services/manager';
import { fmtTime } from '@/utils/time';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import React from 'react';

export default function ManagerPage() {
  const columns: ProColumns<Manager>[] = [
    {
      title: '账号',
      dataIndex: 'username',
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        [ManagerType.Admin]: { text: '超级管理员' },
        [ManagerType.Audit]: { text: '审核管理员' },
        [ManagerType.Data]: { text: '数据管理员' },
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        [ManagerStatus.Active]: { text: '正常' },
        [ManagerStatus.Inactive]: { text: '未激活' },
        [ManagerStatus.Forbidden]: { text: '禁用' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        record.status === ManagerStatus.Forbidden && <a key="enable">启用</a>,
        record.status === ManagerStatus.Active && <a key="forbidden">禁用</a>,
        <a key="delete">删除</a>,
      ],
    },
  ];

  return (
    <PageContainer title="账号管理" header={{ breadcrumb: {} }}>
      <ProTable<Manager, ManagerSearchParams>
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const res = await ManagerApi.search({
            current_page: params.current,
            page_size: params.pageSize,
            keywords: params.keywords,
            ...(params.type ? { type: Number(params.type) } : {}),
            ...(params.status ? { status: Number(params.status) } : {}),
          });
          return {
            data: res.data,
            success: true,
            total: res.total || 0,
          };
        }}
        search={{
          labelWidth: 'auto',
          optionRender: false,
          collapsed: false,
        }}
        toolbar={{
          settings: [],
          actions: [
            <Button key="create" type="primary">
              新建账号
            </Button>,
          ],
        }}
      />
    </PageContainer>
  );
}

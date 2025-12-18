import React from 'react';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Flex, message, Modal, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';

import { adminApi } from '@/lib/api';
import { ManagerTypeText } from '@/constants/manager';
import { createTimeColumn, createActionColumn, createStatusColumn } from '@/hooks';
import { StatusTag } from '@/components';

export interface ManagerTableViewProps {
  actionRef: React.MutableRefObject<any>;
  onAddClick: () => void;
}

export function ManagerTableView(props: ManagerTableViewProps) {
  const { actionRef, onAddClick } = props;

  const { runAsync: remove } = useRequest((id: string) => adminApi.deleteManager(id), {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
    onError: (error: any) => {
      message.error(error?.message || '删除失败');
    },
  });

  const { runAsync: updateStatus } = useRequest(
    (id: string, status: number) => adminApi.updateManager(id, { status }),
    {
      manual: true,
      onSuccess: () => {
        message.success('状态更新成功');
        actionRef.current?.reload();
      },
      onError: (error: any) => {
        message.error(error?.message || '状态更新失败');
      },
    },
  );

  const { runAsync: resetPassword } = useRequest((id: string) => adminApi.resetManagerPassword(id), {
    manual: true,
    onSuccess: (passwd: any) => {
      message.success('密码重置成功');
      Modal.success({
        title: '密码重置成功',
        content: `新密码：${passwd.password}，请保存好密码`,
      });
    },
    onError: (error: any) => {
      message.error(error?.message || '密码重置失败');
    },
  });

  const handleDelete = (manager: Manager) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除账号 "${manager.username}" 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => remove(manager.id),
    });
  };

  const handleUpdateStatus = (manager: Manager) => {
    Modal.confirm({
      title: '状态变更',
      content: `确定要${manager.status === 1 ? '停用' : '启用'}账号 "${manager.username}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => updateStatus(manager.id, manager.status === 1 ? 0 : 1),
    });
  };

  const handleResetPassword = (manager: Manager) => {
    Modal.confirm({
      title: '确认重置密码',
      content: `确定要重置账号 "${manager.username}" 的密码吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => resetPassword(manager.id),
    });
  };

  const columns: ProColumns<Manager>[] = [
    {
      title: '账号',
      dataIndex: 'username',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 150,
      valueType: 'select',
      valueEnum: {
        1: { text: ManagerTypeText[1] },
        2: { text: ManagerTypeText[2] },
      },
      render: (_, record) => ManagerTypeText[record.type],
    },
    createStatusColumn<Manager>('状态', 'status', {
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '启用', status: 'Success' },
        0: { text: '停用', status: 'Error' },
      },
      hideInSearch: false,
      render: (_, record) => <StatusTag status={record.status === 1} />,
    }),
    createTimeColumn<Manager>('创建时间', 'create_time', { width: 180 }),
    createTimeColumn<Manager>('更新时间', 'update_time', { width: 180 }),
    createActionColumn<Manager>(
      (record) => {
        return record.type !== 0 ? (
          <>
            <Button size="small" type="link" danger onClick={() => handleDelete(record)}>
              删除
            </Button>
            <Button size="small" type="link" onClick={() => handleUpdateStatus(record)}>
              {record.status === 1 ? '停用' : '启用'}
            </Button>
            <Button size="small" type="link" onClick={() => handleResetPassword(record)}>
              重置密码
            </Button>
          </>
        ) : null;
      },
      { width: 220 },
    ),
  ];

  return (
    <ProTable<Manager>
      bordered
      cardBordered
      rowKey="id"
      actionRef={actionRef}
      columns={columns}
      request={async () => {
        const data = await adminApi.getAllManagers();
        return {
          data: data || [],
          success: true,
          total: data?.length || 0,
        };
      }}
      search={{ labelWidth: 'auto', defaultFormItemsNumber: 3 }}
      headerTitle={
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAddClick}>
          添加账号
        </Button>
      }
    />
  );
}

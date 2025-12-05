import React, { useRef } from 'react';
import {
  PageContainer,
  ProColumns,
  ModalForm,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, message, Modal, Space } from 'antd';
import { ManagerApi } from '@/services/manager';
import { ManagerType, ManagerTypeText } from '@/constants/manager';
import { useRequest } from 'ahooks';
import { CommonTable } from '@/components/business';
import { createTimeColumn } from '@/hooks';
import { StatusTag } from '@/components/ui';

export default function ManagerPage() {
  const actionRef = useRef<any>();
  const [formVisible, setFormVisible] = React.useState(false);

  const { runAsync: remove } = useRequest((id: string) => ManagerApi.delete(id), {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const { runAsync: add } = useRequest((values) => ManagerApi.add(values), {
    manual: true,
    onSuccess: (passwd) => {
      setFormVisible(false);
      actionRef.current?.reload();
      Modal.success({
        title: '添加成功',
        content: `请保存好密码：${passwd}`,
      });
    },
  });

  const { runAsync: updateStatus } = useRequest(
    (id: string, status: number) => ManagerApi.updateStatus(id, status),
    {
      manual: true,
      onSuccess: () => {
        message.success('状态更新成功');
        actionRef.current?.reload();
      },
    },
  );

  const { runAsync: resetPassword } = useRequest((id: string) => ManagerApi.resetPassword(id), {
    manual: true,
    onSuccess: (passwd) => {
      message.success('密码重置成功');
      Modal.success({
        title: '密码重置成功',
        content: `新密码：${passwd}，请保存好密码`,
      });
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

  const handleUpdateStatus = async (manager: Manager) => {
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
        [ManagerType.Init]: { text: ManagerTypeText[ManagerType.Init] },
        [ManagerType.System]: { text: ManagerTypeText[ManagerType.System] },
        [ManagerType.Audit]: { text: ManagerTypeText[ManagerType.Audit] },
        [ManagerType.Data]: { text: ManagerTypeText[ManagerType.Data] },
      },
      render: (_, record) => ManagerTypeText[record.type],
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '启用', status: 'Success' },
        0: { text: '停用', status: 'Error' },
      },
      render: (_, record) => <StatusTag status={Boolean(record.status)} />,
    },
    createTimeColumn<Manager>('创建时间', 'create_time', { width: 180 }),
    createTimeColumn<Manager>('更新时间', 'update_time', { width: 180 }),
    {
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 200,
      render: (_, record) =>
        record.type !== ManagerType.Init ? (
          <Space size={0}>
            <Button size="small" type="link" danger onClick={() => handleDelete(record)}>
              删除
            </Button>
            <Button size="small" type="link" onClick={() => handleUpdateStatus(record)}>
              {record.status === 1 ? '停用' : '启用'}
            </Button>
            <Button size="small" type="link" onClick={() => handleResetPassword(record)}>
              重置密码
            </Button>
          </Space>
        ) : null,
    },
  ];

  return (
    <PageContainer title="账号管理" header={{ breadcrumb: {} }}>
      <CommonTable<Manager>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async () => {
          const data = await ManagerApi.all();
          return {
            data: data || [],
            success: true,
            total: data?.length || 0,
          };
        }}
        search={{ labelWidth: 'auto', defaultFormItemsNumber: 3 }}
        headerTitle={
          <Button key="add" type="primary" onClick={() => setFormVisible(true)}>
            添加账号
          </Button>
        }
      />
      <ModalForm<CreateManagerModel>
        width={500}
        open={formVisible}
        title="添加账号"
        onFinish={async (values) => {
          await add(values);
          return true;
        }}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            setFormVisible(false);
          },
        }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 4 }}
        initialValues={{ type: ManagerType.System }}
      >
        <div className="pt-3" />
        <ProFormText
          name="username"
          label="账号"
          placeholder="请输入账号"
          rules={[{ required: true, message: '请输入账号' }]}
          fieldProps={{ maxLength: 50 }}
        />
        <ProFormSelect
          name="type"
          label="类型"
          placeholder="请选择类型"
          rules={[{ required: true, message: '请选择类型' }]}
          options={Object.keys(ManagerTypeText)
            .filter((key) => Number(key) > 0)
            .map((key) => ({
              label: ManagerTypeText[Number(key) as ManagerType],
              value: Number(key),
            }))}
        />
      </ModalForm>
    </PageContainer>
  );
}

import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Select, Space, Table, TableProps } from 'antd';
import type { User, UserCreateSchema, UserUpdateSchema } from '../../../types/student';
import { fmtTime } from '@/utils/time';
import { ManagerApi } from '@/services/manager';
import { ManagerType, ManagerTypeText } from '@/constants/manager';
import { useRequest } from 'ahooks';
import { StatusTag } from '@/components/ui';

export default function ManagerPage() {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);

  const { data, loading, refresh } = useRequest(() => ManagerApi.all());

  const { runAsync: remove } = useRequest((id: string) => ManagerApi.delete(id), {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      refresh();
    },
  });

  const { runAsync: add } = useRequest((values) => ManagerApi.add(values), {
    manual: true,
    onSuccess: (passwd) => {
      setVisible(false);
      refresh();
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
        refresh();
      },
    },
  );

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

  const columns: TableProps<Manager>['columns'] = [
    {
      title: '账号',
      dataIndex: 'username',
      minWidth: 150,
    },
    {
      title: '类型',
      dataIndex: 'type',
      minWidth: 150,
      render: (type: ManagerType) => ManagerTypeText[type],
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => <StatusTag status={status} />,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      minWidth: 180,
      render: (time) => fmtTime(time),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      minWidth: 180,
      render: (time) => fmtTime(time),
    },
    {
      title: '操作',
      minWidth: 120,
      render: (_, record) =>
        record.type !== ManagerType.Init ? (
          <Space size={0}>
            <Button size="small" type="link" danger onClick={() => handleDelete(record)}>
              删除
            </Button>
            <Button size="small" type="link" onClick={() => handleUpdateStatus(record)}>
              {record.status === 1 ? '停用' : '启用'}
            </Button>
            <Button size="small" type="link" onClick={() => handleUpdateStatus(record)}>
              重置密码
            </Button>
          </Space>
        ) : undefined,
    },
  ];

  return (
    <PageContainer
      title="账号管理"
      header={{
        breadcrumb: {},
        extra: [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setVisible(true);
              form.setFieldsValue({ username: '', type: ManagerType.System });
            }}
          >
            添加账号
          </Button>,
        ],
      }}
    >
      <Table<Manager> rowKey="id" columns={columns} dataSource={data} loading={loading} />
      <Modal
        centered
        open={visible}
        title="添加账号"
        okText="保存"
        cancelText="取消"
        onOk={() => form.submit()}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
      >
        <Form autoComplete="off" form={form} onFinish={add} className="pt-2" layout="vertical">
          <Form.Item
            label="账号"
            name="username"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="请输入账号" />
          </Form.Item>
          <Form.Item label="类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
            <Select>
              {Object.keys(ManagerTypeText)
                .filter((key) => Number(key) > 0)
                .map((key) => (
                  <Select.Option key={key} value={Number(key)}>
                    {ManagerTypeText[Number(key) as ManagerType]}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

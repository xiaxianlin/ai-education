import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Switch } from 'antd';
import React, { useState } from 'react';
import { searchUsers, createUser, updateUser, updateUserStatus, deleteUser } from '@/services/user';
import type { User, UserCreateSchema, UserUpdateSchema } from '../../../types/user';
import { fmtTime } from '@/utils/time';

export default function UserPage() {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const actionRef = React.useRef<ActionType>();

  const columns: ProColumns<User>[] = [
    {
      title: '用户名',
      dataIndex: 'username',
      width: 150,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        1: { text: '正常' },
        0: { text: '禁用' },
      },
      render: (_, record) => (
        <Switch
          checked={record.status === 1}
          checkedChildren="正常"
          unCheckedChildren="禁用"
          onChange={(checked) => handleStatusChange(record.id, checked ? 1 : 0)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      hideInSearch: true,
      width: 150,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '操作',
      key: 'option',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button key="edit" type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Button key="delete" type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
          删除
        </Button>,
      ],
    },
  ];

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      nickname: user.nickname,
      phone: user.phone,
      email: user.email,
    });
    setModalVisible(true);
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除账号 "${user.username}" 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteUser(user.id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await updateUserStatus(id, status);
      message.success('状态更新成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleSubmit = async (values: UserCreateSchema | UserUpdateSchema) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values as UserUpdateSchema);
        message.success('更新成功');
      } else {
        await createUser(values as UserCreateSchema);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(editingUser ? '更新失败' : '创建失败');
    }
  };

  return (
    <PageContainer
      title="账号管理"
      header={{
        breadcrumb: {},
        extra: [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建账号
          </Button>,
        ],
      }}
    >
      <ProTable<User>
        rowKey="id"
        cardBordered
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const res = await searchUsers({
            current_page: params.current,
            page_size: params.pageSize,
            username: params.username,
            nickname: params.nickname,
            phone: params.phone,
            email: params.email,
            status: params.status ? Number(params.status) : undefined,
          });
          return { 
            data: res.data?.list || [], 
            success: true, 
            total: res.data?.total || 0 
          };
        }}
        search={{ labelWidth: 'auto', defaultFormItemsNumber: 3 }}
        toolbar={{ settings: [] }}
      />
      <Modal
        title={editingUser ? '编辑账号' : '新建账号'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleSubmit} className="pt-2" layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item label="昵称" name="nickname">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
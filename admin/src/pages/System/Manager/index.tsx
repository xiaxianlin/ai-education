import { ManagerStatus, ManagerType, ManagerTypeText } from '@/constants/manager';
import { ManagerApi } from '@/services/manager';
import { fmtTime } from '@/utils/time';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Select, Switch } from 'antd';
import React, { useState } from 'react';

export default function ManagerPage() {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const actionRef = React.useRef<ActionType>();
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
      render: (_, record) =>
        record.status === ManagerStatus.Inactive ? (
          '未激活'
        ) : (
          <Switch
            checked={record.status === ManagerStatus.Active}
            checkedChildren="正常"
            unCheckedChildren="禁用"
            onChange={(checked) => handleStatusChange(record.id, checked ? 1 : -1)}
          />
        ),
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
    setEditingManager(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager(manager);
    form.setFieldsValue({ username: manager.username, type: manager.type });
    setModalVisible(true);
  };

  const handleDelete = (manager: Manager) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除账号 "${manager.username}" 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await ManagerApi.delete(manager.id);
        if (!res) return;
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  const handleStatusChange = async (id: string, status: number) => {
    const res = await ManagerApi.updateStatus(id, status);
    if (!res) return;
    message.success('状态更新成功');
    actionRef.current?.reload();
  };

  const handleSubmit = async (values: CreateManagerModel) => {
    const res = editingManager ? await ManagerApi.update(editingManager.id, values) : await ManagerApi.create(values);
    if (!res) return;
    message.success(editingManager ? '更新成功' : '创建成功');
    setModalVisible(false);
    actionRef.current?.reload();
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
      <ProTable<Manager, ManagerSearchParams>
        rowKey="id"
        cardBordered
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const res = await ManagerApi.search({
            current_page: params.current,
            page_size: params.pageSize,
            keywords: params.keywords,
            ...(params.type ? { type: Number(params.type) } : {}),
            ...(params.status ? { status: Number(params.status) } : {}),
          });
          return { data: res.data, success: true, total: res.total || 0 };
        }}
        search={{ labelWidth: 'auto', defaultFormItemsNumber: 3 }}
        toolbar={{ settings: [] }}
      />
      <Modal
        title={editingManager ? '编辑账号' : '新建账号'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleSubmit} className="pt-2" layout="vertical">
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" disabled={!!editingManager} />
          </Form.Item>
          <Form.Item label="账号类型" name="type" rules={[{ required: true, message: '请选择账号类型' }]}>
            <Select placeholder="请选择账号类型">
              <Select.Option value={ManagerType.Admin}>{ManagerTypeText[ManagerType.Admin]}</Select.Option>
              <Select.Option value={ManagerType.Audit}>{ManagerTypeText[ManagerType.Audit]}</Select.Option>
              <Select.Option value={ManagerType.Data}>{ManagerTypeText[ManagerType.Data]}</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

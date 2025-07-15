import React, { useState } from 'react';
import { ProTable, ProColumns, ActionType, PageContainer } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TextbookVersionApi } from '@/services/textbook-version';
import { fmtTime } from '@/utils/time';

const TextbookVersionManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVersion, setEditingVersion] = useState<TextbookVersion | null>(null);
  const actionRef = React.useRef<ActionType>();

  const columns: ProColumns<TextbookVersion>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '版本名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (text, record) => (
        <Switch
          checked={record.status === 1}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => handleStatusChange(record.id, checked ? 1 : 0)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 180,
      renderText: (time) => fmtTime(time),
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (text, record) => [
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
    setEditingVersion(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (version: TextbookVersion) => {
    setEditingVersion(version);
    form.setFieldsValue({ name: version.name });
    setModalVisible(true);
  };

  const handleDelete = (version: TextbookVersion) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除教材版本 "${version.name}" 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await TextbookVersionApi.delete(version.id);
        if (!res) return;
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  const handleStatusChange = async (id: string, status: number) => {
    const res = await TextbookVersionApi.toggleStatus(id, status);
    if (!res) return;
    message.success('状态更新成功');
    actionRef.current?.reload();
  };

  const handleSubmit = async (values: CreateTextbookVersion) => {
    const res = editingVersion
      ? await TextbookVersionApi.update(editingVersion.id, values)
      : await TextbookVersionApi.create(values);
    if (!res) return;
    message.success(editingVersion ? '更新成功' : '创建成功');
    setModalVisible(false);
    actionRef.current?.reload();
  };

  return (
    <PageContainer
      title="教材版本管理"
      header={{
        breadcrumb: {},
        extra: [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建版本
          </Button>,
        ],
      }}
    >
      <ProTable<TextbookVersion>
        rowKey="id"
        actionRef={actionRef}
        cardBordered
        search={false}
        columns={columns}
        request={async () => {
          const data = await TextbookVersionApi.list();
          return { data, success: true, total: data.length };
        }}
        toolbar={{ settings: [] }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingVersion ? '编辑版本' : '新建版本'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleSubmit} className="pt-4">
          <Form.Item
            label="版本名称"
            name="name"
            rules={[
              { required: true, message: '请输入版本名称' },
              { max: 50, message: '最多输入50个字符' },
            ]}
          >
            <Input placeholder="请输入版本名称" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default TextbookVersionManagement;

import React, { useState } from 'react';
import { ProTable, ProColumns, ActionType, PageContainer } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { SubjectApi } from '@/services/subject';
import { fmtTime } from '@/utils/time';

const { confirm } = Modal;

const SubjectManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const actionRef = React.useRef<ActionType>();

  const columns: ProColumns<Subject>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '科目名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (text, record) => (
        <Switch checked={record.status === 1} onChange={(checked) => handleStatusChange(record.id, checked ? 1 : 0)} />
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
    setEditingSubject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    form.setFieldsValue({ name: subject.name });
    setModalVisible(true);
  };

  const handleDelete = (subject: Subject) => {
    confirm({
      title: '确认删除',
      content: `确定要删除科目 "${subject.name}" 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await SubjectApi.delete(subject.id);
        if (!res) return;
        message.success('删除成功');
        actionRef.current?.reload();
      },
    });
  };

  const handleStatusChange = async (id: string, status: number) => {
    const res = await SubjectApi.toggleStatus(id, status);
    if (!res) return;
    message.success('状态更新成功');
    actionRef.current?.reload();
  };

  const handleSubmit = async (values: CreateSubject) => {
    const res = editingSubject ? await SubjectApi.update(editingSubject.id, values) : await SubjectApi.create(values);
    if (!res) return;
    message.success(editingSubject ? '更新成功' : '创建成功');
    setModalVisible(false);
    actionRef.current?.reload();
  };

  return (
    <PageContainer
      title="学科管理"
      header={{
        breadcrumb: {},
        extra: [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建科目
          </Button>,
        ],
      }}
    >
      <ProTable<Subject>
        actionRef={actionRef}
        rowKey="id"
        cardBordered
        search={false}
        columns={columns}
        request={async () => {
          const data = await SubjectApi.list();
          return { data, success: true, total: data.length };
        }}
        toolbar={{ settings: [] }}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingSubject ? '编辑科目' : '新建科目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleSubmit} className="pt-4">
          <Form.Item label="科目名称" name="name" rules={[{ required: true, message: '请输入科目名称' }]}>
            <Input placeholder="请输入科目名称" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SubjectManagement;

import React, { useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Modal, Form, Select, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TextbookApi } from '@/services/textbook';
import { useTextbookStore } from '@/stores/textbook-store';
import { fmtTime } from '@/utils/time';

const { Option } = Select;
const { confirm } = Modal;

const TextbookManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTextbook, setEditingTextbook] = useState<Textbook | null>(null);
  const actionRef = React.useRef<ActionType>();

  const { subjects, versions, stages, grades, loadSubjects, loadVersions } = useTextbookStore();

  useEffect(() => {
    loadSubjects();
    loadVersions();
  }, [loadSubjects, loadVersions]);

  const columns: ProColumns<Textbook>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '科目',
      dataIndex: 'subject',
      width: 120,
      render: (text) => {
        const subject = subjects.find((s) => s.id === text);
        return subject?.name || text;
      },
    },
    {
      title: '教材版本',
      dataIndex: 'version',
      width: 120,
      render: (text) => {
        const version = versions.find((v) => v.id === text);
        return version?.name || text;
      },
    },
    {
      title: '学习阶段',
      dataIndex: 'stage',
      width: 100,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      width: 80,
      render: (text) => `${text}年级`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (text, record) => (
        <span style={{ color: record.status === 1 ? 'green' : 'red' }}>{record.status === 1 ? '启用' : '禁用'}</span>
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
    setEditingTextbook(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (textbook: Textbook) => {
    setEditingTextbook(textbook);
    form.setFieldsValue({
      subject: textbook.subject,
      version: textbook.version,
      stage: textbook.stage,
      grade: textbook.grade,
    });
    setModalVisible(true);
  };

  const handleDelete = (textbook: Textbook) => {
    confirm({
      title: '确认删除',
      content: `确定要删除该教材吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await TextbookApi.delete(textbook.id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSubmit = async (values: CreateTextbook) => {
    try {
      if (editingTextbook) {
        await TextbookApi.update(editingTextbook.id, values);
        message.success('更新成功');
      } else {
        await TextbookApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(editingTextbook ? '更新失败' : '创建失败');
    }
  };

  return (
    <div>
      <ProTable<Textbook>
        headerTitle="教材管理"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async () => {
          const data = await TextbookApi.list();
          return {
            data,
            success: true,
            total: data.length,
          };
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建教材
          </Button>,
        ]}
      />

      <Modal
        title={editingTextbook ? '编辑教材' : '新建教材'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item label="科目" name="subject" rules={[{ required: true, message: '请选择科目' }]}>
            <Select placeholder="请选择科目">
              {subjects.map((subject) => (
                <Option key={subject.id} value={subject.id}>
                  {subject.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="教材版本" name="version" rules={[{ required: true, message: '请选择教材版本' }]}>
            <Select placeholder="请选择教材版本">
              {versions.map((version) => (
                <Option key={version.id} value={version.id}>
                  {version.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="学习阶段" name="stage" rules={[{ required: true, message: '请选择学习阶段' }]}>
            <Select placeholder="请选择学习阶段">
              {stages.map((stage) => (
                <Option key={stage} value={stage}>
                  {stage}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="年级" name="grade" rules={[{ required: true, message: '请选择年级' }]}>
            <Select placeholder="请选择年级">
              {grades.map((grade) => (
                <Option key={grade} value={grade}>
                  {grade}年级
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TextbookManagement;

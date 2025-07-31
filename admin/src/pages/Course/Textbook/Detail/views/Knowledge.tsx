import React, { useState } from 'react';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, message } from 'antd';
import { CourseUnitApi } from '@/services/course-unit';
import { fmtTime } from '@/utils/time';
import { TextbookApi } from '@/services/textbook';
import { useTextbookDetailModel } from '../models/page';
import { StatusTag } from '@/components/ui';
import { PlusOutlined } from '@ant-design/icons';

export const KnowledgeView: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const actionRef = React.useRef<ActionType>();
  const { id } = useTextbookDetailModel();

  const columns: ProColumns<Knowledge>[] = [
    { title: '知识点名称', dataIndex: 'name' },
    { title: '知识点内容', dataIndex: 'content', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => <StatusTag status={!!status} />,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      renderText: (time) => fmtTime(time),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      renderText: (time) => fmtTime(time),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (text, record) => [
        <Button key="edit" type="link" onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Button key="delete" type="link" danger onClick={() => handleDelete(record)}>
          删除
        </Button>,
      ],
    },
  ];

  const handleAdd = () => {
    setKnowledge(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (unit: Knowledge) => {
    setKnowledge(unit);
    form.setFieldsValue({
      textbook_id: id,
      name: unit.name,
      content: unit.content,
    });
    setModalVisible(true);
  };

  const handleDelete = (unit: Knowledge) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除知识点 "${unit.name}" 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await CourseUnitApi.delete(unit.id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSubmit = async (values: { textbook_id: number; name: string; content: string }) => {
    try {
      if (knowledge) {
        // 更新时不传name，使用UpdateCourseUnit接口
        await CourseUnitApi.update(knowledge.id, { name: values.name, content: values.content });
        message.success('更新成功');
      } else {
        // 创建时需要name
        await CourseUnitApi.create(values);
        message.success('创建成功');
      }

      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(knowledge ? '更新失败' : '创建失败');
    }
  };

  return (
    <div className="custom-table">
      <Button
        size="small"
        type="primary"
        className="absolute right-0 top-[-48px]"
        icon={<PlusOutlined />}
        onClick={() => handleAdd()}
      >
        添加知识点
      </Button>
      <ProTable<Knowledge>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        scroll={{ x: 'max-content' }}
        toolbar={{ settings: [] }}
        request={async () => {
          const data = await TextbookApi.getKnowledges(id);
          return { data, success: true, total: data.length };
        }}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={knowledge ? '编辑知识点' : '新程知识点'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item label="知识点名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入知识点名称" maxLength={100} />
          </Form.Item>

          <Form.Item label="知识点内容" name="content" rules={[{ required: true }]}>
            <Input.TextArea rows={6} placeholder="请输入知识点内容" maxLength={2000} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Modal, Form, Select, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CourseUnitApi } from '@/services/course-unit';
import { useTextbookStore } from '@/stores/textbook-store';
import { fmtTime } from '@/utils/time';

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const CourseUnitManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUnit, setEditingUnit] = useState<CourseUnit | null>(null);
  const actionRef = React.useRef<ActionType>();

  const { textbooks, loadTextbooks } = useTextbookStore();

  useEffect(() => {
    loadTextbooks();
  }, [loadTextbooks]);

  const columns: ProColumns<CourseUnit>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '教材',
      dataIndex: ['textbook', 'id'],
      width: 200,
      render: (text, record) => {
        const textbook = textbooks.find(t => t.id === record.textbook.id);
        if (!textbook) return record.textbook.id;
        
        const subject = textbooks.find(t => t.id === record.textbook.id);
        return `${subject?.subject || ''} ${subject?.stage || ''}${subject?.grade || ''}级`;
      },
    },
    {
      title: '课程单元名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '内容',
      dataIndex: 'content',
      width: 300,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (text, record) => (
        <span style={{ color: record.status === 1 ? 'green' : 'red' }}>
          {record.status === 1 ? '启用' : '禁用'}
        </span>
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
      title: '更新时间',
      dataIndex: 'update_time',
      width: 180,
      renderText: (time) => fmtTime(time),
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (text, record) => [
        <Button
          key="edit"
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        <Button
          key="delete"
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>,
      ],
    },
  ];

  const handleAdd = () => {
    setEditingUnit(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (unit: CourseUnit) => {
    setEditingUnit(unit);
    form.setFieldsValue({
      textbook_id: unit.textbook.id,
      name: unit.name,
      content: unit.content,
    });
    setModalVisible(true);
  };

  const handleDelete = (unit: CourseUnit) => {
    confirm({
      title: '确认删除',
      content: `确定要删除课程单元 "${unit.name}" 吗？`,
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

  const handleSubmit = async (values: { textbook_id: string; name: string; content: string }) => {
    try {
      const unitData = {
        textbook_id: Number(values.textbook_id),
        content: values.content,
      };

      if (editingUnit) {
        // 更新时不传name，使用UpdateCourseUnit接口
        await CourseUnitApi.update(editingUnit.id, { content: values.content });
        message.success('更新成功');
      } else {
        // 创建时需要name
        await CourseUnitApi.create({
          ...unitData,
          content: `${values.name}\n${values.content}`,
        });
        message.success('创建成功');
      }
      
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(editingUnit ? '更新失败' : '创建失败');
    }
  };

  return (
    <div>
      <ProTable<CourseUnit>
        headerTitle="课程单元管理"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async () => {
          const data = await CourseUnitApi.list();
          return {
            data,
            success: true,
            total: data.length,
          };
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建课程单元
          </Button>,
        ]}
      />

      <Modal
        title={editingUnit ? '编辑课程单元' : '新建课程单元'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="教材"
            name="textbook_id"
            rules={[{ required: true, message: '请选择教材' }]}
          >
            <Select placeholder="请选择教材" disabled={!!editingUnit}>
              {textbooks.map((textbook) => {
                const subject = textbooks.find(t => t.id === textbook.id);
                const label = subject 
                  ? `${subject.subject} ${subject.stage}${subject.grade}级`
                  : textbook.id;
                
                return (
                  <Option key={textbook.id} value={textbook.id}>
                    {label}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {!editingUnit && (
            <Form.Item
              label="课程单元名称"
              name="name"
              rules={[{ required: true, message: '请输入课程单元名称' }]}
            >
              <Input placeholder="请输入课程单元名称" maxLength={100} />
            </Form.Item>
          )}

          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入课程内容' }]}
          >
            <TextArea
              rows={6}
              placeholder="请输入课程内容"
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseUnitManagement;
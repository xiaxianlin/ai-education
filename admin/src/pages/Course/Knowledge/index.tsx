import React, { useState, useEffect } from 'react';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Modal, Form, Select, Input, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SoundOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { KnowledgeApi } from '@/services/knowledge';
import { useTextbookStore } from '@/pages/Course/Textbook/List/store';
import { fmtTime } from '@/utils/time';

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const KnowledgeManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<Knowledge | null>(null);
  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [uploadingKnowledgeId, setUploadingKnowledgeId] = useState<string | null>(null);

  const actionRef = React.useRef<ActionType>();
  const { courseUnits, loadCourseUnits } = useTextbookStore();

  useEffect(() => {
    loadCourseUnits();
  }, [loadCourseUnits]);

  const columns: ProColumns<Knowledge>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '课程单元',
      dataIndex: ['course_unit', 'id'],
      width: 200,
      render: (text, record) => {
        const unit = courseUnits.find(u => u.id === record.course_unit.id);
        return unit?.name || record.course_unit.id;
      },
    },
    {
      title: '知识点内容',
      dataIndex: 'content',
      width: 300,
      ellipsis: true,
    },
    {
      title: '解析文本',
      dataIndex: 'analysis_text',
      width: 200,
      ellipsis: true,
      render: (text) => text || <span style={{ color: '#999' }}>暂无</span>,
    },
    {
      title: '多媒体',
      dataIndex: 'analysis_audio',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.analysis_audio && <Tag color="blue" icon={<SoundOutlined />}>音频</Tag>}
          {record.analysis_video && <Tag color="green" icon={<VideoCameraOutlined />}>视频</Tag>}
        </Space>
      ),
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
      width: 200,
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
        <Space key="media" direction="vertical" size="small" style={{ marginTop: 4 }}>
          <Button
            size="small"
            type="text"
            icon={<SoundOutlined />}
            onClick={() => handleAudioUpload(record.id)}
            disabled={uploadingKnowledgeId === record.id}
          >
            音频
          </Button>
          <Button
            size="small"
            type="text"
            icon={<VideoCameraOutlined />}
            onClick={() => handleVideoUpload(record.id)}
            disabled={uploadingKnowledgeId === record.id}
          >
            视频
          </Button>
        </Space>
      ],
    },
  ];

  const handleAdd = () => {
    setEditingKnowledge(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (knowledge: Knowledge) => {
    setEditingKnowledge(knowledge);
    form.setFieldsValue({
      course_unit_id: knowledge.course_unit.id,
      content: knowledge.content,
      analysis_text: knowledge.analysis_text,
    });
    setModalVisible(true);
  };

  const handleDelete = (knowledge: Knowledge) => {
    confirm({
      title: '确认删除',
      content: `确定要删除知识点吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await KnowledgeApi.delete(knowledge.id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleAudioUpload = (id: string) => {
    setUploadingKnowledgeId(id);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await KnowledgeApi.uploadAudio(id, file);
          message.success('音频上传成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('音频上传失败');
        } finally {
          setUploadingKnowledgeId(null);
        }
      }
    };
    input.click();
  };

  const handleVideoUpload = (id: string) => {
    setUploadingKnowledgeId(id);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          await KnowledgeApi.uploadVideo(id, file);
          message.success('视频上传成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('视频上传失败');
        } finally {
          setUploadingKnowledgeId(null);
        }
      }
    };
    input.click();
  };

  const handleSubmit = async (values: {
    course_unit_id: string;
    content: string;
    analysis_text?: string;
  }) => {
    try {
      const knowledgeData = {
        course_unit_id: Number(values.course_unit_id),
        content: values.content,
        ...(values.analysis_text && { content: `${values.content}\n${values.analysis_text}` })
      };

      if (editingKnowledge) {
        await KnowledgeApi.update(editingKnowledge.id, { content: values.content });
        message.success('更新成功');
      } else {
        await KnowledgeApi.create(knowledgeData);
        message.success('创建成功');
      }

      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(editingKnowledge ? '更新失败' : '创建失败');
    }
  };

  return (
    <div>
      <ProTable<Knowledge>
        headerTitle="知识点管理"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        request={async () => {
          const data = await KnowledgeApi.list();
          return {
            data,
            success: true,
            total: data.length,
          };
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建知识点
          </Button>,
        ]}
      />

      <Modal
        title={editingKnowledge ? '编辑知识点' : '新建知识点'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={700}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="课程单元"
            name="course_unit_id"
            rules={[{ required: true, message: '请选择课程单元' }]}
          >
            <Select placeholder="请选择课程单元" disabled={!!editingKnowledge}>
              {courseUnits.map((unit) => (
                <Option key={unit.id} value={unit.id}>
                  {unit.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="知识点内容"
            name="content"
            rules={[{ required: true, message: '请输入知识点内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入知识点内容"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="解析文本"
            name="analysis_text"
          >
            <TextArea
              rows={6}
              placeholder="请输入知识点解析文本"
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeManagement;

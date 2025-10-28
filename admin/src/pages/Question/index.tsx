import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Form, Input, message, Modal, Select, InputNumber } from 'antd';
import React, { useState } from 'react';
import { searchQuestions, createQuestion, updateQuestion, deleteQuestion } from '@/services/question';
import type { Question, QuestionCreateSchema, QuestionUpdateSchema } from '../../../types/question';
import { fmtTime } from '@/utils/time';

const { TextArea } = Input;

export default function QuestionPage() {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const actionRef = React.useRef<ActionType>();

  const columns: ProColumns<Question>[] = [
    {
      title: '题目标题',
      dataIndex: 'title',
      ellipsis: true,
      width: 200,
    },
    {
      title: '题目内容',
      dataIndex: 'content',
      ellipsis: true,
      hideInSearch: true,
      width: 300,
      render: (text) => text || '-',
    },
    {
      title: '知识点ID',
      dataIndex: 'knowledge_id',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '课程单元ID',
      dataIndex: 'course_unit_id',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '教材ID',
      dataIndex: 'textbook_id',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 80,
      valueType: 'select',
      valueEnum: {
        1: { text: '简单' },
        2: { text: '中等' },
        3: { text: '困难' },
      },
      render: (_, record) => {
        const difficultyMap: Record<number, string> = {
          1: '简单',
          2: '中等', 
          3: '困难',
        };
        return record.difficulty ? difficultyMap[record.difficulty] || record.difficulty : '-';
      },
    },
    {
      title: '题目类型',
      dataIndex: 'question_type',
      width: 100,
      render: (text) => text || '-',
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
    setEditingQuestion(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    form.setFieldsValue({
      title: question.title,
      content: question.content,
      knowledge_id: question.knowledge_id,
      course_unit_id: question.course_unit_id,
      textbook_id: question.textbook_id,
      difficulty: question.difficulty,
      question_type: question.question_type,
    });
    setModalVisible(true);
  };

  const handleDelete = (question: Question) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除题目 "${question.title}" 吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteQuestion(question.id);
        if (res) {
          message.success('删除成功');
          actionRef.current?.reload();
        }
      },
    });
  };

  const handleSubmit = async (values: QuestionCreateSchema | QuestionUpdateSchema) => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, values as QuestionUpdateSchema);
        message.success('更新成功');
      } else {
        await createQuestion(values as QuestionCreateSchema);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(editingQuestion ? '更新失败' : '创建失败');
    }
  };

  return (
    <PageContainer
      title="问题管理"
      header={{
        breadcrumb: {},
        extra: [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建问题
          </Button>,
        ],
      }}
    >
      <ProTable<Question>
        rowKey="id"
        cardBordered
        columns={columns}
        actionRef={actionRef}
        request={async (params) => {
          const res = await searchQuestions({
            current_page: params.current,
            page_size: params.pageSize,
            title: params.title,
            knowledge_id: params.knowledge_id ? Number(params.knowledge_id) : undefined,
            course_unit_id: params.course_unit_id ? Number(params.course_unit_id) : undefined,
            textbook_id: params.textbook_id ? Number(params.textbook_id) : undefined,
            difficulty: params.difficulty ? Number(params.difficulty) : undefined,
            question_type: params.question_type,
          });
          return { 
            data: res.data?.list || [], 
            success: true, 
            total: res.data?.total || 0 
          };
        }}
        search={{ labelWidth: 'auto', defaultFormItemsNumber: 3 }}
        toolbar={{ settings: [] }}
        scroll={{ x: 1200 }}
      />
      <Modal
        title={editingQuestion ? '编辑问题' : '新建问题'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="保存"
        cancelText="取消"
        width={800}
      >
        <Form form={form} onFinish={handleSubmit} className="pt-2" layout="vertical">
          <Form.Item label="题目标题" name="title" rules={[{ required: true, message: '请输入题目标题' }]}>
            <Input placeholder="请输入题目标题" />
          </Form.Item>
          <Form.Item label="题目内容" name="content">
            <TextArea placeholder="请输入题目内容" rows={4} />
          </Form.Item>
          <Form.Item label="知识点ID" name="knowledge_id">
            <InputNumber placeholder="请输入知识点ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="课程单元ID" name="course_unit_id">
            <InputNumber placeholder="请输入课程单元ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="教材ID" name="textbook_id">
            <InputNumber placeholder="请输入教材ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="难度" name="difficulty">
            <Select placeholder="请选择难度">
              <Select.Option value={1}>简单</Select.Option>
              <Select.Option value={2}>中等</Select.Option>
              <Select.Option value={3}>困难</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="题目类型" name="question_type">
            <Input placeholder="请输入题目类型" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
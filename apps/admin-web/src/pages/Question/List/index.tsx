import { DeleteButton, SubjectGradeTabs } from '@/components';
import { createActionColumn, useDelete } from '@/hooks';
import { DIFFICULTY_LABELS, INTERACTION_TYPE_LABELS, isCompositeQuestion } from '@ai-education/shared-web';
import { EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Flex, Form, Input, Modal, Select, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionApi } from '../api';

// 题目预览模态框
const QuestionPreviewModal: React.FC<{
  question?: Question;
  open: boolean;
  onClose: () => void;
}> = ({ question, open, onClose }) => {
  if (!question) return null;

  const isComposite = isCompositeQuestion(question);

  return (
    <Modal title="题目预览" open={open} onCancel={onClose} footer={null} width={800}>
      <div className="space-y-4">
        {/* 基本信息 */}
        <div className="flex gap-2 flex-wrap">
          <Tag color="blue">{question.subject}</Tag>
          <Tag color="green">{question.grade}年级</Tag>
          <Tag color="purple">
            {INTERACTION_TYPE_LABELS[question.questionTypeCode as keyof typeof INTERACTION_TYPE_LABELS] ||
              question.questionTypeCode}
          </Tag>
          <Tag color="orange">{DIFFICULTY_LABELS[question.difficulty as Difficulty]}</Tag>
          {isComposite && <Tag color="red">复合题</Tag>}
        </div>

        {/* 题干 */}
        <div className="bg-gray-50 p-4 rounded">
          <div className="font-medium mb-2">题干</div>
          <div
            dangerouslySetInnerHTML={{
              __html: question.stem.richText || question.stem.text,
            }}
          />
        </div>

        {/* 选项 */}
        {question.options && question.options.length > 0 && (
          <div>
            <div className="font-medium mb-2">选项</div>
            <div className="space-y-2">
              {question.options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className={`p-2 rounded border ${opt.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {opt.text}
                  {opt.isCorrect && (
                    <Tag color="success" className="ml-2">
                      正确答案
                    </Tag>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 子题（复合题） */}
        {isComposite && question.stem.subQuestions && (
          <div>
            <div className="font-medium mb-2">子题</div>
            <div className="space-y-4">
              {question.stem.subQuestions.map((sub, idx) => (
                <div key={sub.id} className="border rounded p-3">
                  <div className="font-medium text-gray-600 mb-2">
                    第 {idx + 1} 小题
                    <Tag className="ml-2">
                      {INTERACTION_TYPE_LABELS[sub.interactionType as keyof typeof INTERACTION_TYPE_LABELS] ||
                        sub.interactionType}
                    </Tag>
                  </div>
                  <div className="mb-2">{sub.stem.text}</div>
                  {sub.options && (
                    <div className="pl-4">
                      {sub.options.map((opt, optIdx) => (
                        <div key={optIdx} className="text-sm">
                          {String.fromCharCode(65 + optIdx)}. {opt.text || opt.id}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 解析 */}
        {question.explanation && (
          <div className="bg-blue-50 p-4 rounded">
            <div className="font-medium mb-2">解析</div>
            <div>{question.explanation}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default function QuestionListV2Page() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('语文');
  const [grade, setGrade] = useState(1);
  const [params, setParams] = useState<Record<string, unknown>>({});
  const [previewQuestion, setPreviewQuestion] = useState<Question>();
  const [previewOpen, setPreviewOpen] = useState(false);

  const [form] = Form.useForm();
  const actionRef = React.useRef<ActionType>();

  // 删除题目
  const { handleDelete } = useDelete(QuestionApi.deleteQuestion, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const columns: ProColumns<Question>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '题干',
      dataIndex: ['stem', 'text'],
      ellipsis: true,
      width: 300,
    },
    {
      title: '题型',
      dataIndex: 'questionTypeCode',
      width: 120,
      render: (_, record) => (
        <Tag color="purple">
          {INTERACTION_TYPE_LABELS[record.questionTypeCode as keyof typeof INTERACTION_TYPE_LABELS] ||
            record.questionTypeCode}
        </Tag>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      width: 80,
      render: (_, record) => (
        <Tag color={record.difficulty === 'easy' ? 'green' : record.difficulty === 'medium' ? 'orange' : 'red'}>
          {DIFFICULTY_LABELS[record.difficulty as Difficulty]}
        </Tag>
      ),
    },
    {
      title: '类型',
      width: 80,
      render: (_, record) => (isCompositeQuestion(record) ? <Tag color="volcano">复合题</Tag> : <Tag>单题</Tag>),
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      width: 80,
      sorter: true,
    },
    {
      title: '正确率',
      dataIndex: 'correctRate',
      width: 80,
      render: (rate) => (rate ? `${rate}%` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      width: 80,
      render: (_, record) => (record.isActive ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>),
    },
    createActionColumn<Question>(
      (record) => (
        <>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setPreviewQuestion(record);
              setPreviewOpen(true);
            }}
          >
            预览
          </Button>
          <Button type="link" onClick={() => navigate(`/question/form/${record.id}`)}>
            编辑
          </Button>
          <DeleteButton
            title="确定要删除这道题目吗？"
            onConfirm={() => handleDelete(record.id)}
            buttonProps={{ type: 'link' }}
          />
        </>
      ),
      { width: 180 },
    ),
  ];

  useEffect(() => {
    actionRef.current?.reload?.(true);
  }, [subject, grade, params]);

  return (
    <PageContainer title="题目管理" header={{ breadcrumb: {} }}>
      <SubjectGradeTabs subject={subject} grade={grade} setSubject={setSubject} setGrade={setGrade} />
      <ProTable<Question>
        actionRef={actionRef}
        bordered
        cardBordered
        rowKey="id"
        search={false}
        columns={columns}
        pagination={{ pageSize: 20 }}
        toolbar={{
          settings: [
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/question/form')}>
              新建题目
            </Button>,
            <Button icon={<ReloadOutlined />} size="large" onClick={() => actionRef.current?.reload()}>
              刷新
            </Button>,
          ],
        }}
        request={async ({ current, pageSize }) => {
          const res = await QuestionApi.searchQuestions({
            page: current,
            pageSize,
            subject,
            grade,
            ...params,
          });
          return {
            data: res?.items || [],
            total: res?.total || 0,
            success: true,
          };
        }}
        headerTitle={
          <Form size="large" layout="inline" form={form} onFinish={(values) => setParams({ ...values })}>
            <Form.Item name="keyword">
              <Space.Compact>
                <Space.Addon>关键词：</Space.Addon>
                <Input placeholder="搜索题干内容" allowClear style={{ width: 200 }} />
              </Space.Compact>
            </Form.Item>
            <Form.Item name="difficulty">
              <Select
                allowClear
                placeholder="难度"
                style={{ width: 100 }}
                options={Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({
                  value,
                  label,
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Flex gap={8}>
                <Button type="primary" onClick={() => form.submit()}>
                  搜索
                </Button>
                <Button
                  onClick={() => {
                    setParams({});
                    form.resetFields();
                  }}
                >
                  重置
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        }
      />

      {/* 题目预览模态框 */}
      <QuestionPreviewModal question={previewQuestion} open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </PageContainer>
  );
}

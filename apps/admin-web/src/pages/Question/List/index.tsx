import React from 'react';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { QuestionApi } from '../api';
import { useConfigs, useDelete, createActionColumn } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { Button, Flex, Form, Input, Select, Space } from 'antd';
import { DeleteButton, SubjectGradeTabs } from '@/components';
import { renderResourceTypeTag, renderResourceStatusTag } from '@/utils/tag';
import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';

export default function QuestionListPage() {
  const navigate = useNavigate();
  const { question_types } = useConfigs();
  const [subject, setSubject] = useState('英语');
  const [grade, setGrade] = useState(1);
  const [params, setParams] = useState<SearchQuestionRequest>({});

  const [form] = Form.useForm();
  const actionRef = React.useRef<ActionType>();

  // 删除题目
  const { handleDelete } = useDelete(QuestionApi.deleteQuestion, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const questionColumns: ProColumns<Question>[] = [
    { title: 'ID', dataIndex: 'id' },
    { title: '题目', dataIndex: 'content', minWidth: 300 },
    {
      title: '题型',
      minWidth: 70,
      renderText: (_, record) => `${record.type}（${record.subtype}）`,
    },
    { title: '难度', minWidth: 60, dataIndex: 'difficulty' },
    {
      title: '资源类型',
      dataIndex: 'resource_type',
      minWidth: 90,
      renderText: renderResourceTypeTag,
    },
    {
      title: '资源状态',
      dataIndex: 'resource_generated',
      minWidth: 90,
      render: (_, record) =>
        renderResourceStatusTag(Boolean(record.resource && record.resource.trim()), record.resource_type || undefined),
    },
    createActionColumn<Question>(
      (record) => (
        <>
          <Button type="link" onClick={() => navigate(`/question/detail/${record.id}`)}>
            详情
          </Button>
          <Button type="link" onClick={() => navigate(`/question/form/${record.id}`)}>
            编辑
          </Button>
          <DeleteButton
            title="确定要删除这道题目吗？"
            onConfirm={() => handleDelete(String(record.id))}
            buttonProps={{ type: 'link' }}
          />
        </>
      ),
      { width: 140 },
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
        columns={questionColumns}
        pagination={{ pageSize: 10 }}
        toolbar={{
          settings: [
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/question/form')}>
              新建题目
            </Button>,
          ],
        }}
        request={async ({ current, pageSize }) => {
          const res = await QuestionApi.searchQuestions({ page: current, size: pageSize, subject, grade, ...params });
          return {
            data: res?.data || [],
            total: res?.total || 0,
            success: true,
          };
        }}
        headerTitle={[
          <Form size="large" layout="inline" form={form} onFinish={(values) => setParams({ ...values })}>
            <Form.Item name="question_id">
              <Space.Compact>
                <Space.Addon>ID:</Space.Addon>
                <Input placeholder="题目ID" allowClear style={{ width: 300 }} />
              </Space.Compact>
            </Form.Item>
            <Form.Item name="content">
              <Space.Compact>
                <Space.Addon>题目：</Space.Addon>
                <Input placeholder="请输入题目内容" allowClear style={{ width: 200 }} />
              </Space.Compact>
            </Form.Item>
            <Form.Item name="type" style={{ width: 230 }}>
              <Space.Compact>
                <Space.Addon>题型：</Space.Addon>
                <Select
                  allowClear
                  placeholder="请选择题型"
                  options={question_types.map((scene) => ({ label: scene, value: scene }))}
                  style={{ width: 160 }}
                />
              </Space.Compact>
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
          </Form>,
        ]}
      />
    </PageContainer>
  );
}

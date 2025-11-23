import { useParams, history } from '@umijs/max';
import {
  PageContainer,
  ProForm,
  ProFormSelect,
  ProFormTextArea,
  ProFormText,
  ProDescriptions,
} from '@ant-design/pro-components';
import { QuestionApi } from '@/services/question';
import { useConfigs } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Button, Space, Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { GRADES } from '@/constants/course';
import { StatusTag } from '@/components/ui';

export default function QuestionEditPage() {
  const { id } = useParams<{ id: string }>();
  const { subjectEnum, gradeEnum, questionTypeEmun, difficultyLevelEmun, question_subtypes } = useConfigs();
  const [form] = ProForm.useForm<QuestionUpdateForm>();
  
  // 获取当前选择的题型，用于动态显示子类型选项
  const selectedType = ProForm.useWatch('type', form);
  
  // 根据选择的题型获取对应的子类型选项
  const subtypeOptions = useMemo(() => {
    if (!selectedType || !question_subtypes) return {};
    const subtypes = question_subtypes[selectedType] || [];
    return subtypes.reduce((prev: Record<string, string>, curr: string) => ({ ...prev, [curr]: curr }), {});
  }, [selectedType, question_subtypes]);

  const { data: question, loading } = useRequest(() => QuestionApi.get(id!), {
    ready: !!id,
    onError: () => {
      message.error('加载问题失败');
      history.back();
    },
  });

  const { runAsync: handleSubmit, loading: submitting } = useRequest(
    async (values: QuestionUpdateForm) => {
      const submitData: QuestionUpdateForm = { ...values };
      await QuestionApi.update(id!, submitData);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('更新成功');
        history.back();
      },
      onError: () => {
        message.error('更新失败');
      },
    },
  );

  useEffect(() => {
    if (question) {
      const formValues: any = { ...question, grade: String(question.grade) };
      form.setFieldsValue(formValues);
    }
  }, [question, form]);

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!question) {
    return null;
  }

  const gradeInfo = question.grade ? GRADES[question.grade] : undefined;

  return (
    <PageContainer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => history.back()}
            style={{ padding: 0, height: 'auto' }}
          />
          <span>编辑题目</span>
        </div>
      }
      header={{
        breadcrumb: {},
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 基本信息卡片 */}
        <Card title="题目信息">
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="教材" span={3}>
              {question?.textbook?.file}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="科目">{question.subject}</ProDescriptions.Item>
            <ProDescriptions.Item label="阶段">{gradeInfo?.stage || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="年级">{gradeInfo?.grade || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="题型">{question.type}</ProDescriptions.Item>
            {question.subtype && (
              <ProDescriptions.Item label="子类型">{question.subtype}</ProDescriptions.Item>
            )}
            <ProDescriptions.Item label="难度">{question.difficulty}</ProDescriptions.Item>
            <ProDescriptions.Item label="单元">{question?.unit?.name}</ProDescriptions.Item>
            <ProDescriptions.Item label="知识点">{question?.knowledge || '-'}</ProDescriptions.Item>
          </ProDescriptions>
        </Card>

        {/* 编辑表单 */}
        <Card title="编辑表单">
          <ProForm<QuestionUpdateForm>
            form={form}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            submitter={{
              render: (props) => {
                return (
                  <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button onClick={() => history.back()}>取消</Button>
                    <Button
                      type="primary"
                      loading={submitting}
                      onClick={() => props.form?.submit?.()}
                    >
                      保存
                    </Button>
                  </Space>
                );
              },
            }}
            onFinish={handleSubmit}
          >
            <ProFormSelect
              name="type"
              label="题型"
              placeholder="请选择题型"
              valueEnum={questionTypeEmun}
              rules={[{ required: true, message: '请选择题型' }]}
            />
            {selectedType && Object.keys(subtypeOptions).length > 0 && (
              <ProFormSelect
                name="subtype"
                label="子类型"
                placeholder="请选择子类型（可选）"
                valueEnum={subtypeOptions}
                allowClear
              />
            )}
            <ProFormTextArea
              name="content"
              label="题目内容"
              placeholder="请输入题目内容"
              fieldProps={{ rows: 4, maxLength: 2000 }}
              rules={[{ required: true, message: '请输入题目内容' }]}
            />
            <ProFormTextArea
              name="options"
              label="选项"
              placeholder='请输入选项（每行一个选项，或输入JSON数组格式如：["选项A","选项B","选项C","选项D"]）'
              fieldProps={{ rows: 4 }}
              extra="如果是选择题，可以每行输入一个选项，或者输入JSON数组格式"
            />
            <ProFormText
              name="answer"
              label="答案"
              placeholder="请输入答案"
              fieldProps={{ maxLength: 500 }}
            />
            <ProFormSelect
              name="difficulty"
              label="难度"
              placeholder="请选择难度"
              valueEnum={difficultyLevelEmun}
            />
          </ProForm>
        </Card>
      </Space>
    </PageContainer>
  );
}

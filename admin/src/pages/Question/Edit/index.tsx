import { useParams, history } from '@umijs/max';
import { PageContainer, ProForm, ProFormSelect, ProFormTextArea, ProFormText, ProDescriptions } from '@ant-design/pro-components';
import { QuestionApi } from '@/services/question';
import { useConfigs } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Button, Space, Card } from 'antd';
import { useEffect } from 'react';
import { GRADES } from '@/constants/course';
import { StatusTag } from '@/components/ui';

export default function QuestionEditPage() {
  const { id } = useParams<{ id: string }>();
  const { subjectEnum, gradeEnum, questionTypeEmun, difficultyLevelEmun } = useConfigs();
  const [form] = ProForm.useForm<QuestionUpdateForm>();

  const { data: question, loading } = useRequest(
    () => QuestionApi.get(id!),
    {
      ready: !!id,
      onError: () => {
        message.error('加载问题失败');
        history.back();
      },
    }
  );

  const { runAsync: handleSubmit, loading: submitting } = useRequest(
    async (values: QuestionUpdateForm) => {
      // 处理options，如果是数组则转为JSON字符串
      const submitData: QuestionUpdateForm = { ...values };
      if (values.options) {
        if (Array.isArray(values.options)) {
          submitData.options = JSON.stringify(values.options);
        } else if (typeof values.options === 'string') {
          // 如果已经是字符串，检查是否是JSON格式
          try {
            JSON.parse(values.options);
            // 已经是有效的JSON，保持不变
          } catch {
            // 不是JSON，按换行符分割后转为JSON数组
            const lines = values.options.split('\n').filter(line => line.trim());
            if (lines.length > 0) {
              submitData.options = JSON.stringify(lines);
            }
          }
        }
      }
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
    }
  );

  useEffect(() => {
    if (question) {
      // 处理options，如果是JSON字符串则解析为数组或换行分隔的字符串
      const formValues: any = { ...question };
      if (question.options) {
        try {
          const parsed = JSON.parse(question.options);
          if (Array.isArray(parsed)) {
            // 将数组转换为换行分隔的字符串，更易编辑
            formValues.options = parsed.join('\n');
          } else {
            formValues.options = question.options;
          }
        } catch {
          // 如果解析失败，保持原值（可能是换行分隔的文本）
          formValues.options = question.options;
        }
      }
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
      title="编辑题目"
      header={{
        breadcrumb: {},
        extra: [
          <Button key="back" onClick={() => history.back()}>
            返回
          </Button>,
        ],
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* 基本信息卡片 */}
        <Card title="题目信息">
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="题目ID">{question.id}</ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <StatusTag status={question.status === 1} />
            </ProDescriptions.Item>
            <ProDescriptions.Item label="科目">{question.subject}</ProDescriptions.Item>
            <ProDescriptions.Item label="阶段">{gradeInfo?.stage || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="年级">{gradeInfo?.grade || '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="题型">{question.type}</ProDescriptions.Item>
            {question.difficulty && (
              <ProDescriptions.Item label="难度">{question.difficulty}</ProDescriptions.Item>
            )}
            {question.resource && (
              <ProDescriptions.Item label="资源路径">{question.resource}</ProDescriptions.Item>
            )}
            {question.textbook && (
              <ProDescriptions.Item label="所属教材" span={3}>
                {question.textbook.subject} - {question.textbook.version} - {gradeInfo?.grade} - {question.textbook.semester}
              </ProDescriptions.Item>
            )}
            {question.unit && (
              <ProDescriptions.Item label="所属单元" span={3}>
                {question.unit.name}
              </ProDescriptions.Item>
            )}
            {question.knowledge && (
              <ProDescriptions.Item label="所属知识点" span={3}>
                {question.knowledge.name}
              </ProDescriptions.Item>
            )}
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {question.create_time * 1000}
            </ProDescriptions.Item>
            {question.update_time && (
              <ProDescriptions.Item label="更新时间" valueType="dateTime">
                {question.update_time * 1000}
              </ProDescriptions.Item>
            )}
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
              render: (props, doms) => {
                return (
                  <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button onClick={() => history.back()}>取消</Button>
                    <Button type="primary" loading={submitting} onClick={() => props.form?.submit?.()}>
                      保存
                    </Button>
                  </Space>
                );
              },
            }}
            onFinish={handleSubmit}
          >
            <ProFormSelect
              name="subject"
              label="科目"
              placeholder="请选择科目"
              valueEnum={subjectEnum}
              rules={[{ required: true, message: '请选择科目' }]}
            />
            <ProFormSelect
              name="grade"
              label="年级"
              placeholder="请选择年级"
              valueEnum={gradeEnum}
              rules={[{ required: true, message: '请选择年级' }]}
            />
            <ProFormSelect
              name="type"
              label="题型"
              placeholder="请选择题型"
              valueEnum={questionTypeEmun}
              rules={[{ required: true, message: '请选择题型' }]}
            />
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
            <ProFormText
              name="resource"
              label="资源路径"
              placeholder="请输入资源路径（如图片、音频等）"
              fieldProps={{ maxLength: 255 }}
            />
            <ProFormSelect
              name="status"
              label="状态"
              options={[
                { label: '启用', value: 1 },
                { label: '停用', value: 0 },
              ]}
            />
          </ProForm>
        </Card>
      </Space>
    </PageContainer>
  );
}


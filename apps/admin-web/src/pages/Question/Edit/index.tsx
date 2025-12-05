import { useParams, useNavigate } from 'react-router-dom';
import {
  PageContainer,
  ProForm,
  ProFormSelect,
  ProFormTextArea,
  ProFormText,
} from '@ant-design/pro-components';
import { adminApi } from '@ai-education/shared-frontend';
import { useConfigs } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Button, Space, Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { GRADES } from '@/constants/course';

// 资源类型选项
const resourceTypeOptions = {
  image: '图片',
  audio: '音频',
  '': '无',
};

export default function QuestionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjectEnum, gradeEnum, questionTypeEmun, difficultyLevelEmun, question_subtypes } =
    useConfigs();
  const [form] = ProForm.useForm<QuestionUpdateForm>();

  // 获取当前选择的题型，用于动态显示子类型选项
  const selectedType = ProForm.useWatch('type', form);

  // 获取当前选择的教材ID，用于动态加载单元列表
  const selectedTextbookId = ProForm.useWatch('textbook_id', form);

  // 根据选择的题型获取对应的子类型选项
  const subtypeOptions = useMemo(() => {
    if (!selectedType || !question_subtypes) return {};
    const subtypes = question_subtypes[selectedType] || [];
    return subtypes.reduce(
      (prev: Record<string, string>, curr: string) => ({ ...prev, [curr]: curr }),
      {},
    );
  }, [selectedType, question_subtypes]);

  // 获取所有教材列表
  const { data: textbookOptions } = useRequest(async () => {
    const res = await adminApi.searchTextbooks({ page: 1, size: 1000 });
    return (res.data || []).reduce((prev: Record<number, string>, curr) => {
      const gradeInfo = GRADES[curr.grade];
      const label = `${curr.subject} - ${curr.version} - ${gradeInfo?.grade || curr.grade}年级 - ${
        curr.semester
      }`;
      prev[curr.id] = label;
      return prev;
    }, {});
  });

  // 根据选择的教材ID获取单元列表
  const { data: unitOptions } = useRequest(
    async () => {
      if (!selectedTextbookId) return [];
      const units = await adminApi.getTextbookUnits(selectedTextbookId);
      return units.reduce((prev: Record<number, string>, curr) => {
        prev[curr.id] = curr.name;
        return prev;
      }, {});
    },
    {
      ready: !!selectedTextbookId,
      refreshDeps: [selectedTextbookId],
    },
  );

  const { data: question, loading } = useRequest(() => adminApi.getQuestion(id!), {
    ready: !!id,
    onError: () => {
      message.error('加载问题失败');
      navigate(-1);
    },
  });

  const { runAsync: handleSubmit, loading: submitting } = useRequest(
    async (values: QuestionUpdateForm) => {
      const submitData: QuestionUpdateForm = { ...values };
      await adminApi.updateQuestion(id!, submitData);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('更新成功');
        navigate(-1);
      },
      onError: () => {
        message.error('更新失败');
      },
    },
  );

  useEffect(() => {
    if (question) {
      const formValues: any = {
        ...question,
        grade: String(question.grade),
        textbook_id: question.textbook_id?.toString(),
        unit_id: question.unit_id || undefined,
      };
      form.setFieldsValue(formValues);
    }
  }, [question, form]);

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!question) {
    return null;
  }

  return (
    <PageContainer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{ padding: 0, height: 'auto' }}
          />
          <span>编辑题目</span>
        </div>
      }
      header={{
        breadcrumb: {},
      }}
    >
      <Card>
        <ProForm<QuestionUpdateForm>
          grid
          form={form}
          submitter={{
            render: (props) => {
              return (
                <Space style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button onClick={() => navigate(-1)}>取消</Button>
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
            name="subject"
            label="科目"
            placeholder="请选择科目"
            valueEnum={subjectEnum}
            colProps={{ span: 12 }}
            rules={[{ required: true, message: '请选择科目' }]}
          />
          <ProFormSelect
            name="grade"
            label="年级"
            placeholder="请选择年级"
            valueEnum={gradeEnum}
            colProps={{ span: 12 }}
            rules={[{ required: true, message: '请选择年级' }]}
          />
          <ProFormSelect
            name="type"
            label="题目类型"
            placeholder="请选择题型"
            colProps={{ span: 12 }}
            valueEnum={questionTypeEmun}
            rules={[{ required: true, message: '请选择题型' }]}
          />
          <ProFormSelect
            name="subtype"
            label="题目子类型"
            placeholder="请选择子类型（可选）"
            valueEnum={subtypeOptions}
            colProps={{ span: 12 }}
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
            label="问题答案"
            placeholder="请输入答案"
            fieldProps={{ maxLength: 500 }}
            colProps={{ span: 12 }}
          />
          <ProFormSelect
            name="difficulty"
            label="问题难度"
            placeholder="请选择难度"
            valueEnum={difficultyLevelEmun}
            colProps={{ span: 12 }}
          />
          <ProFormText
            name="resource"
            label="资源路径"
            placeholder="请输入资源路径"
            fieldProps={{ maxLength: 255 }}
            colProps={{ span: 12 }}
          />
          <ProFormSelect
            name="resource_type"
            label="资源类型"
            placeholder="请选择资源类型"
            valueEnum={resourceTypeOptions}
            allowClear
            colProps={{ span: 12 }}
          />
          <ProFormTextArea
            name="resource_content"
            label="资源内容"
            placeholder="请输入资源内容（录音文本等）"
            fieldProps={{ rows: 3 }}
          />
          <ProFormSelect
            name="textbook_id"
            label="教材"
            placeholder="请选择教材"
            valueEnum={textbookOptions}
            rules={[{ required: true, message: '请选择教材' }]}
            colProps={{ span: 12 }}
            fieldProps={{
              onChange: () => {
                // 切换教材时清空单元选择
                form.setFieldsValue({ unit_id: undefined });
              },
            }}
          />
          <ProFormSelect
            name="unit_id"
            label="单元"
            placeholder="请先选择教材，然后选择单元（可选）"
            valueEnum={unitOptions}
            disabled={!selectedTextbookId}
            colProps={{ span: 12 }}
            allowClear
          />
          <ProFormText
            name="knowledge"
            label="知识点"
            placeholder="请输入知识点"
            fieldProps={{ maxLength: 255 }}
          />
        </ProForm>
      </Card>
    </PageContainer>
  );
}

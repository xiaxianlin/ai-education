import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const isEdit = !!id;

  // 加载详情数据
  const { loading: fetchingDetails } = useRequest(
    async () => {
      if (id) {
        return QuestionApi.getQuestionTemplate(Number(id));
      }
      return null;
    },
    {
      refreshDeps: [id],
      onSuccess: (res) => {
        if (res) {
          form.setFieldsValue({
            ...res,
            variables: res.variables ? JSON.stringify(res.variables, null, 2) : undefined,
            outputSchema: res.output_schema ? JSON.stringify(res.output_schema, null, 2) : undefined,
          });
        }
      },
    },
  );

  // 获取题型列表
  const { data: questionTypes } = useRequest(() => QuestionApi.listAllQuestionTypes());

  // 提交表单
  const { run: handleSubmit, loading: submitting } = useRequest(
    async (values: any) => {
      const payload = {
        ...values,
        variables: values.variables ? JSON.parse(values.variables) : undefined,
        output_schema: values.outputSchema ? JSON.parse(values.outputSchema) : undefined,
      };

      if (isEdit) {
        await QuestionApi.updateQuestionTemplate(Number(id!), payload);
      } else {
        await QuestionApi.createQuestionTemplate(payload);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
        navigate('/question_template');
      },
      onError: (err) => {
        message.error(err.message || '保存失败');
      },
    },
  );

  return {
    form,
    isEdit,
    id,
    navigate,
    questionTypes,
    fetchingDetails,
    submitting,
    handleSubmit,
  };
};

export const QuestionTemplateFormModel = createContainer(useContainer);
export const useQuestionTemplateFormModel = QuestionTemplateFormModel.useContainer;


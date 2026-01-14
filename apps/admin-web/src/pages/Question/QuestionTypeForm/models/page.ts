import { useConfigs } from '@/hooks';
import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects } = useConfigs();
  const [form] = Form.useForm();

  const isEdit = !!id;

  // 加载详情数据
  const { loading: fetchingDetails } = useRequest(() => QuestionApi.getQuestionType(Number(id)), {
    ready: !!id,
    refreshDeps: [id],
    onSuccess: (res) => {
      if (!res) return;
      form.setFieldsValue({
        // 基础字段
        code: res.code,
        name: res.name,
        description: res.description,
        subject: res.subject,
        category: res.category,
        gradeBand: res.grade_band,
        abilityCode: res.ability_code,
        // 配置字段
        mediaContext: res.media_context ? JSON.stringify(res.media_context, null, 2) : undefined,
        scaffoldingConfig: res.scaffolding_config ? JSON.stringify(res.scaffolding_config, null, 2) : undefined,
        evaluationConfig: res.evaluation_config ? JSON.stringify(res.evaluation_config, null, 2) : undefined,
        // AI 配置
        prompt: res.prompt,
      });
    },
  });

  // 监听表单字段变化
  // const subject = Form.useWatch('subject', form);
  // const gradeBand = Form.useWatch('gradeBand', form);

  // TODO: 能力数据加载逻辑需要根据新的 ability_code 字段调整
  // const { atomics } = useAbilityData(subject, grades);

  // 提交表单
  const { run: handleSubmit, loading: submitting } = useRequest(
    async (values: any) => {
      const payload: QuestionTypeCreateRequest | QuestionTypeUpdateRequest = {
        // 基础字段
        name: values.name,
        description: values.description,
        subject: values.subject,
        category: values.category,
        grade_band: values.gradeBand,
        ability_code: values.abilityCode,
        // 配置字段
        media_context: values.mediaContext ? JSON.parse(values.mediaContext) : undefined,
        scaffolding_config: values.scaffoldingConfig ? JSON.parse(values.scaffoldingConfig) : undefined,
        evaluation_config: values.evaluationConfig ? JSON.parse(values.evaluationConfig) : undefined,
        // AI 配置
        prompt: values.prompt,
      };

      // 新建模式下才包含编码字段
      if (!isEdit) {
        (payload as QuestionTypeCreateRequest).code = values.code;
      }

      // 移除 undefined 字段
      Object.keys(payload).forEach((key) => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      if (isEdit) {
        await QuestionApi.updateQuestionType(Number(id!), payload as QuestionTypeUpdateRequest);
      } else {
        await QuestionApi.createQuestionType(payload as QuestionTypeCreateRequest);
      }
    },
    {
      manual: true,
      onSuccess: () => message.success('保存成功'),
    },
  );

  return {
    form,
    isEdit,
    id,
    navigate,
    subjects,
    fetchingDetails,
    submitting,
    handleSubmit,
  };
};

export const QuestionTypeFormModel = createContainer(useContainer);
export const useQuestionTypeFormModel = QuestionTypeFormModel.useContainer;

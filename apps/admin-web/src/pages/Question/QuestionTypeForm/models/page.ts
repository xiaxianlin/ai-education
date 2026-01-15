import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 验证 type 参数
  useEffect(() => {
    if (type && type !== 'unit' && type !== 'ability') {
      message.error('无效的题型类型');
      navigate('/question_type');
    }
  }, [type, navigate]);

  // 映射 type 到 category
  const category = type === 'unit' ? 'unit_practice' : 'ability_practice';

  const isEdit = !!id;

  // 加载详情数据
  const { loading: fetchingDetails } = useRequest(() => QuestionApi.getQuestionType(Number(id!)), {
    ready: !!id,
    refreshDeps: [id],
    onSuccess: (res) => {
      if (!res) return;
      
      // 验证数据中的 category 是否与路由 type 匹配
      if (res.category !== category) {
        message.error('题型分类不匹配');
        navigate('/question_type');
        return;
      }
      
      form.setFieldsValue({
        // 基础字段
        code: res.code,
        name: res.name,
        description: res.description,
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
        category: category, // 固定使用路由参数映射的 category
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
    type,
    category,
    navigate,
    fetchingDetails,
    submitting,
    handleSubmit,
  };
};

export const QuestionTypeFormModel = createContainer(useContainer);
export const useQuestionTypeFormModel = QuestionTypeFormModel.useContainer;

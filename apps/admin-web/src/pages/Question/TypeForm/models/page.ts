import { useConfigs } from '@/hooks';
import { STAGE_GRADES, Stage } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subjects } = useConfigs();
  const [form] = Form.useForm();
  const [selectedStages, setSelectedStages] = useState<Stage[]>([]);

  const isEdit = !!id;

  // 监听学段变化，自动计算可选年级
  const availableGrades = selectedStages.flatMap((stage) => STAGE_GRADES[stage as keyof typeof STAGE_GRADES] || []);

  // 加载详情数据
  const { loading: fetchingDetails } = useRequest(
    async () => {
      if (id) {
        return QuestionApi.getQuestionType(Number(id));
      }
      return null;
    },
    {
      refreshDeps: [id],
      onSuccess: (res) => {
        if (res) {
          setSelectedStages(res.stages || []);
          form.setFieldsValue({
            ...res,
            interactionConfig: res.interaction_config ? JSON.stringify(res.interaction_config, null, 2) : undefined,
            resourceConfig: res.resource_config ? JSON.stringify(res.resource_config, null, 2) : undefined,
            answerConfig: res.answer_config ? JSON.stringify(res.answer_config, null, 2) : undefined,
            feedbackConfig: res.feedback_config ? JSON.stringify(res.feedback_config, null, 2) : undefined,
          });
        }
      },
    },
  );

  // 处理学段变化
  const handleStagesChange = (stages: Stage[]) => {
    setSelectedStages(stages);
    // 清空不在范围内的年级
    const currentGrades = form.getFieldValue('grades') || [];
    const validGrades = currentGrades.filter((g: number) =>
      stages.some((stage) => STAGE_GRADES[stage as keyof typeof STAGE_GRADES]?.includes(g)),
    );
    form.setFieldValue('grades', validGrades);
  };

  // 提交表单
  const { run: handleSubmit, loading: submitting } = useRequest(
    async (values: any) => {
      const payload = {
        ...values,
        interaction_config: values.interactionConfig ? JSON.parse(values.interactionConfig) : undefined,
        resource_config: values.resourceConfig ? JSON.parse(values.resourceConfig) : undefined,
        answer_config: values.answerConfig ? JSON.parse(values.answerConfig) : undefined,
        feedback_config: values.feedbackConfig ? JSON.parse(values.feedbackConfig) : undefined,
      };

      if (isEdit) {
        await QuestionApi.updateQuestionType(Number(id!), payload);
      } else {
        await QuestionApi.createQuestionType(payload);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
        navigate('/question_type');
      },
      onError: (err: any) => {
        message.error(err.message || '保存失败');
      },
    },
  );

  return {
    form,
    isEdit,
    id,
    navigate,
    subjects,
    selectedStages,
    availableGrades,
    fetchingDetails,
    submitting,
    handleStagesChange,
    handleSubmit,
  };
};

export const QuestionTypeFormModel = createContainer(useContainer);
export const useQuestionTypeFormModel = QuestionTypeFormModel.useContainer;


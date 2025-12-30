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
            // 基础字段
            code: res.code,
            name: res.name,
            description: res.description,
            subject: res.subject,
            stages: res.stages,
            grades: res.grades,
            // 交互配置
            interactionType: res.interaction_type,
            interactionConfig: res.interaction_config ? JSON.stringify(res.interaction_config, null, 2) : undefined,
            // 资源配置
            resourceType: res.resource_type,
            resourceConfig: res.resource_config ? JSON.stringify(res.resource_config, null, 2) : undefined,
            // 答案配置
            answerType: res.answer_type,
            answerConfig: res.answer_config ? JSON.stringify(res.answer_config, null, 2) : undefined,
            // 反馈配置
            feedbackConfig: res.feedback_config ? JSON.stringify(res.feedback_config, null, 2) : undefined,
            // 认知配置
            cognitiveLevels: res.cognitive_levels,
            abilityDimensions: res.ability_dimensions,
            // AI 配置
            aiPrompt: res.ai_prompt,
            // 其他设置
            sortOrder: res.sort_order,
            isActive: res.is_active,
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
      const payload: any = {
        // 基础字段
        name: values.name,
        description: values.description,
        subject: values.subject,
        stages: values.stages,
        grades: values.grades,
        // 交互配置
        interaction_type: values.interactionType,
        interaction_config: values.interactionConfig ? JSON.parse(values.interactionConfig) : undefined,
        // 资源配置
        resource_type: values.resourceType || 'text',
        resource_config: values.resourceConfig ? JSON.parse(values.resourceConfig) : undefined,
        // 答案配置
        answer_type: values.answerType,
        answer_config: values.answerConfig ? JSON.parse(values.answerConfig) : undefined,
        // 反馈配置
        feedback_config: values.feedbackConfig ? JSON.parse(values.feedbackConfig) : undefined,
        // 认知配置
        cognitive_levels: values.cognitiveLevels,
        ability_dimensions: values.abilityDimensions,
        // AI 配置
        ai_prompt: values.aiPrompt,
        // 其他设置
        sort_order: values.sortOrder ?? 0,
        is_active: values.isActive ?? true,
      };

      // 新建模式下才包含编码字段
      if (!isEdit) {
        payload.code = values.code;
      }

      // 移除 undefined 字段
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      if (isEdit) {
        await QuestionApi.updateQuestionType(Number(id!), payload);
      } else {
        await QuestionApi.createQuestionType(payload);
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

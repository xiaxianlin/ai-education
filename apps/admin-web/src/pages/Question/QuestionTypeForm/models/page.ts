import { useConfigs } from '@/hooks';
import { STAGE_GRADES, Stage } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';
import { useAbilityData } from '../hooks/useAbilityData';

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
            difficulty: res.difficulty,
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
            // 能力关联
            domain_code: res.domain_code,
            ability_atomic_codes: res.ability_atomic_codes,
            // 认知配置
            cognitiveLevels: res.cognitive_levels,
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

  // 监听表单字段变化
  const subject = Form.useWatch('subject', form);
  const grades = Form.useWatch('grades', form);
  const domainCode = Form.useWatch('domain_code', form);

  // 使用新的 hook 加载能力数据
  const { domains, atomics } = useAbilityData(subject, domainCode, grades);

  // 当科目变化时，清空能力域和原子能力
  useEffect(() => {
    if (!subject) {
      form.setFieldValue('domain_code', undefined);
      form.setFieldValue('ability_atomic_codes', []);
    }
  }, [subject, form]);

  // 当能力域变化时，清空已选择的原子能力（仅在非加载状态下）
  useEffect(() => {
    if (!fetchingDetails && domainCode !== undefined) {
      form.setFieldValue('ability_atomic_codes', []);
    }
  }, [domainCode, form, fetchingDetails]);

  // 当年级变化时，清空已选择的原子能力（仅在非加载状态下）
  useEffect(() => {
    if (!fetchingDetails && grades && grades.length > 0) {
      form.setFieldValue('ability_atomic_codes', []);
    }
  }, [grades, form, fetchingDetails]);

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
        difficulty: values.difficulty,
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
        // 能力关联
        domain_code: values.domain_code,
        ability_atomic_codes: values.ability_atomic_codes,
        // 认知配置
        cognitive_levels: values.cognitiveLevels,
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
    domains,
    atomics,
  };
};

export const QuestionTypeFormModel = createContainer(useContainer);
export const useQuestionTypeFormModel = QuestionTypeFormModel.useContainer;

import { useConfigs } from '@/hooks';
import { STAGE_GRADES, Stage } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

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
        return PracticeApi.getPractice(Number(id));
      }
      return null;
    },
    {
      refreshDeps: [id],
      onSuccess: (res) => {
        if (res) {
          setSelectedStages((res.stages as Stage[]) || []);
          form.setFieldsValue({
            name: res.name,
            slug: res.slug,
            icon: res.icon,
            description: res.description,
            specialty_type: res.specialty_type,
            subject: res.subject,
            stages: res.stages,
            grades: res.grades,
            question_count_config: res.question_count_config
              ? JSON.stringify(res.question_count_config, null, 2)
              : undefined,
            difficulty_config: res.difficulty_config ? JSON.stringify(res.difficulty_config, null, 2) : undefined,
            ability_config: res.ability_config ? JSON.stringify(res.ability_config, null, 2) : undefined,
            feedback_config: res.feedback_config ? JSON.stringify(res.feedback_config, null, 2) : undefined,
            prompt: res.prompt,
            is_active: res.is_active,
          });
        }
      },
    },
  );

  // 处理学段变化
  const handleStagesChange = (stages: Stage[]) => {
    setSelectedStages(stages);
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
        name: values.name,
        slug: values.slug,
        icon: values.icon,
        description: values.description,
        specialty_type: values.specialty_type,
        subject: values.subject,
        stages: values.stages,
        grades: values.grades,
        question_count_config: values.question_count_config ? JSON.parse(values.question_count_config) : undefined,
        difficulty_config: values.difficulty_config ? JSON.parse(values.difficulty_config) : undefined,
        ability_config: values.ability_config ? JSON.parse(values.ability_config) : undefined,
        feedback_config: values.feedback_config ? JSON.parse(values.feedback_config) : undefined,
        prompt: values.prompt,
        is_active: values.is_active ?? true,
      };

      // 移除 undefined 字段
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      if (isEdit) {
        await PracticeApi.updatePractice(Number(id!), payload);
      } else {
        await PracticeApi.createPractice(payload);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
        navigate('/practice');
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

export const PracticeFormModel = createContainer(useContainer);
export const usePracticeFormModel = PracticeFormModel.useContainer;

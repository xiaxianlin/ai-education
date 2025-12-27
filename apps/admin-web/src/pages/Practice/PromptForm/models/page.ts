import { useConfigs } from '@/hooks';
import { getSpecialtyOptions, Stage, STAGE_GRADES } from '@ai-education/shared-web';
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
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const isEdit = !!id;

  // 监听学段变化，自动计算可选年级
  const availableGrades = selectedStages.flatMap((stage) => STAGE_GRADES[stage as keyof typeof STAGE_GRADES] || []);

  // 获取专项类型选项
  const specialtyOptions = getSpecialtyOptions(selectedSubject);

  // 加载详情数据
  const { loading: fetchingDetails } = useRequest(
    async () => {
      if (id) {
        return PracticeApi.getPracticePromptDetail(Number(id));
      }
      return null;
    },
    {
      refreshDeps: [id],
      onSuccess: (res) => {
        if (res) {
          setSelectedStages((res.stages as Stage[]) || []);
          setSelectedSubject(res.subject || '');
          form.setFieldsValue({
            name: res.name,
            code: res.code,
            description: res.description,
            scene_type: res.scene_type,
            specialty_type: res.specialty_type,
            subject: res.subject,
            stages: res.stages,
            grades: res.grades,
            semesters: res.semesters,
            practice_id: res.practice_id,
            practice_slug: res.practice_slug,
            prompt_id: res.prompt_id,
            prompt_slug: res.prompt_slug,
            question_type_configs: res.question_type_configs
              ? JSON.stringify(res.question_type_configs, null, 2)
              : undefined,
            difficulty_config: res.difficulty_config ? JSON.stringify(res.difficulty_config, null, 2) : undefined,
            question_count_config: res.question_count_config
              ? JSON.stringify(res.question_count_config, null, 2)
              : undefined,
            template_variables: res.template_variables ? JSON.stringify(res.template_variables, null, 2) : undefined,
            sort_order: res.sort_order,
            is_active: res.is_active,
          });
        }
      },
    },
  );

  // 加载练习列表
  const { data: practiceOptions = [] } = useRequest(async () => {
    const res = await PracticeApi.listPractices({ page: 1, size: 1000 });
    return (res?.data || []).map((p) => ({
      label: `${p.name} (${p.slug})`,
      value: p.id,
    }));
  });

  // 处理学段变化
  const handleStagesChange = (stages: Stage[]) => {
    setSelectedStages(stages);
    const currentGrades = form.getFieldValue('grades') || [];
    const validGrades = currentGrades.filter((g: number) =>
      stages.some((stage) => STAGE_GRADES[stage as keyof typeof STAGE_GRADES]?.includes(g)),
    );
    form.setFieldValue('grades', validGrades);
  };

  // 处理科目变化
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    form.setFieldValue('specialty_type', undefined);
  };

  // 提交表单
  const { run: handleSubmit, loading: submitting } = useRequest(
    async (values: any) => {
      const payload: any = {
        name: values.name,
        description: values.description,
        scene_type: values.scene_type,
        specialty_type: values.specialty_type,
        subject: values.subject,
        stages: values.stages,
        grades: values.grades,
        semesters: values.semesters,
        practice_id: values.practice_id,
        question_type_configs: values.question_type_configs ? JSON.parse(values.question_type_configs) : undefined,
        difficulty_config: values.difficulty_config ? JSON.parse(values.difficulty_config) : undefined,
        question_count_config: values.question_count_config ? JSON.parse(values.question_count_config) : undefined,
        template_variables: values.template_variables ? JSON.parse(values.template_variables) : undefined,
        sort_order: values.sort_order ?? 0,
        is_active: values.is_active ?? true,
      };

      // 新建模式下才包含 code 字段
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
        await PracticeApi.updatePracticePrompt(Number(id!), payload);
      } else {
        await PracticeApi.createPracticePrompt(payload);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
        navigate('/practice/prompt');
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
    selectedSubject,
    availableGrades,
    specialtyOptions,
    practiceOptions,
    fetchingDetails,
    submitting,
    handleStagesChange,
    handleSubjectChange,
    handleSubmit,
  };
};

export const PromptFormModel = createContainer(useContainer);
export const usePromptFormModel = PromptFormModel.useContainer;

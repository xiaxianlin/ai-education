import { useConfigs } from '@/hooks';
import { STAGE_GRADES, Stage } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { subjects } = useConfigs();
  const [form] = Form.useForm();
  const [selectedStages, setSelectedStages] = useState<Stage[]>([]);

  // 判断是否为克隆模式（路径包含 /clone/）
  const isClone = location.pathname.includes('/clone/');
  const cloneId = isClone ? id : undefined;
  const isEdit = !!id && !isClone;

  // 监听学段变化，自动计算可选年级
  const availableGrades = selectedStages.flatMap((stage) => STAGE_GRADES[stage as keyof typeof STAGE_GRADES] || []);

  // 加载详情数据（编辑或克隆模式）
  const { loading: fetchingDetails } = useRequest(
    async () => {
      const targetId = isClone ? cloneId : id;
      if (targetId) {
        return PracticeApi.getPractice(Number(targetId));
      }
      return null;
    },
    {
      refreshDeps: [id, cloneId],
      onSuccess: (res) => {
        if (res) {
          setSelectedStages((res.stages as Stage[]) || []);
          
          // 将能力分布从对象格式转换为数组格式
          let abilityDistribution = res.ability_config?.distribution;
          if (abilityDistribution && typeof abilityDistribution === 'object' && !Array.isArray(abilityDistribution)) {
            abilityDistribution = Object.entries(abilityDistribution).map(([key, value]) => ({
              key,
              value,
            }));
          }
          
          // 克隆模式下，修改名称和标识，添加"副本"后缀
          const name = isClone ? `${res.name} (副本)` : res.name;
          const slug = isClone ? `${res.slug}_copy` : res.slug;
          
          form.setFieldsValue({
            name,
            slug,
            icon: res.icon,
            description: res.description,
            specialty_type: res.specialty_type,
            subject: res.subject,
            stages: res.stages,
            grades: res.grades,
            question_count_config: res.question_count_config,
            difficulty_config: res.difficulty_config,
            ability_config: {
              ...res.ability_config,
              distribution: abilityDistribution,
            },
            feedback_config: res.feedback_config,
            prompt: res.prompt,
            is_active: res.is_active ?? true,
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
      // 将能力分布从数组格式转换为对象格式
      let abilityDistribution = values.ability_config?.distribution;
      if (Array.isArray(abilityDistribution) && abilityDistribution.length > 0) {
        abilityDistribution = abilityDistribution.reduce((acc: Record<string, number>, item: { key: string; value: number }) => {
          if (item?.key && item?.value !== undefined) {
            acc[item.key] = item.value;
          }
          return acc;
        }, {});
        // 如果转换后为空对象，设为 undefined
        if (Object.keys(abilityDistribution).length === 0) {
          abilityDistribution = undefined;
        }
      } else {
        abilityDistribution = undefined;
      }
      
      const payload: any = {
        name: values.name,
        slug: values.slug,
        icon: values.icon,
        description: values.description,
        specialty_type: values.specialty_type,
        subject: values.subject,
        stages: values.stages,
        grades: values.grades,
        question_count_config: values.question_count_config,
        difficulty_config: values.difficulty_config,
        ability_config: {
          ...values.ability_config,
          distribution: abilityDistribution,
        },
        feedback_config: values.feedback_config,
        prompt: values.prompt,
        is_active: values.is_active ?? true,
      };

      // 移除 undefined 字段
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      
      // 如果能力配置的 distribution 为空，也移除它
      if (payload.ability_config && !payload.ability_config.distribution) {
        delete payload.ability_config.distribution;
      }

      // 克隆模式始终创建新记录
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
    isClone,
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

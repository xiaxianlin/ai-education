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
        if (!res) return;
        setSelectedStages((res.stages as Stage[]) || []);
        form.setFieldsValue({ ...res });
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
      // 克隆模式始终创建新记录
      if (isEdit) {
        await PracticeApi.updatePractice(Number(id!), values);
      } else {
        await PracticeApi.createPractice(values);
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

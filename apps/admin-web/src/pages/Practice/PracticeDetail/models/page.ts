import { useRequest } from 'ahooks';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 获取练习详情
  const { data: detail, loading } = useRequest(
    async () => {
      if (id) {
        return PracticeApi.getPractice(Number(id));
      }
      return null;
    },
    {
      refreshDeps: [id],
    },
  );

  // 获取关联的练习提示词配置列表
  const { data: prompts, loading: loadingPrompts } = useRequest(
    async () => {
      if (id) {
        const result = await PracticeApi.listPracticePrompts({ practice_id: Number(id) });
        return result?.data || [];
      }
      return [];
    },
    {
      refreshDeps: [id],
    },
  );

  const handleEdit = () => {
    navigate(`/practice/form/${id}`);
  };

  const handleBack = () => {
    navigate('/practice');
  };

  const handleConfigParams = () => {
    navigate(`/practice/config/${id}`);
  };

  const handleViewPrompt = (promptId: number) => {
    navigate(`/practice/prompt/detail/${promptId}`);
  };

  const handleAddPrompt = () => {
    navigate(`/practice/prompt/form?practice_id=${id}`);
  };

  return {
    id,
    detail,
    loading,
    prompts,
    loadingPrompts,
    navigate,
    handleEdit,
    handleBack,
    handleConfigParams,
    handleViewPrompt,
    handleAddPrompt,
  };
};

export const PracticeDetailModel = createContainer(useContainer);
export const usePracticeDetailModel = PracticeDetailModel.useContainer;

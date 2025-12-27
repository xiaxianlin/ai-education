import { useRequest } from 'ahooks';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

const useContainer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: detail, loading } = useRequest(
    async () => {
      if (id) {
        return PracticeApi.getPracticePromptDetail(Number(id));
      }
      return null;
    },
    {
      refreshDeps: [id],
    },
  );

  const handleEdit = () => {
    navigate(`/practice/prompt/form/${id}`);
  };

  const handleBack = () => {
    navigate('/practice/prompt');
  };

  return {
    id,
    detail,
    loading,
    navigate,
    handleEdit,
    handleBack,
  };
};

export const PromptDetailModel = createContainer(useContainer);
export const usePromptDetailModel = PromptDetailModel.useContainer;

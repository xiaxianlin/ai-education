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

  const handleEdit = () => {
    navigate(`/practice/form/${id}`);
  };

  const handleBack = () => {
    navigate('/practice');
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

export const PracticeDetailModel = createContainer(useContainer);
export const usePracticeDetailModel = PracticeDetailModel.useContainer;

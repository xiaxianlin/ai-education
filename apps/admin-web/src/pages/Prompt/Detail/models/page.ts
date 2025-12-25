import { useRequest } from 'ahooks';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PromptApi } from '../../api';

const useContainer = () => {
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get('id') || 0);

  const navigate = useNavigate();

  const {
    data: prompt,
    loading,
    refresh,
  } = useRequest(() => PromptApi.getPromptDetail(id), {
    ready: !!id,
  });

  return {
    prompt,
    loading,
    refresh,
    navigate,
  };
};

export const PromptDetailModel = createContainer(useContainer);
export const usePromptDetailModel = PromptDetailModel.useContainer;

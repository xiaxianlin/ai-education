import { useSearchParams, useNavigate } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PromptApi } from '../../api';
import { useRequest } from 'ahooks';

const useContainer = () => {
  const [searchParams] = useSearchParams();
  const versionId = Number(searchParams.get('version_id') || 0);

  const navigate = useNavigate();

  const {
    data: prompt,
    loading,
    refresh,
  } = useRequest(() => PromptApi.getPromptDetail(versionId), {
    ready: !!versionId,
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

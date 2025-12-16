import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { message } from 'antd';
import { adminApi } from '@/lib/api';
import { useRequest } from 'ahooks';

const useContainer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const versionId = Number(searchParams.get('version_id') || 0);
  const { runAsync: handleSubmit, loading } = useRequest(
    async ({ model_params, ...params }: SavePromptRequest) => {
      model_params = model_params ? JSON.parse(model_params) : undefined;
      return versionId
        ? adminApi.updatePrompt(versionId, { ...params, model_params })
        : adminApi.createPrompt({ ...params, model_params });
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('保存成功');
        navigate(`/prompt`);
      },
    },
  );

  return {
    loading,
    versionId,
    handleSubmit,
  };
};

export const PromptFormModel = createContainer(useContainer);
export const usePromptFormModel = PromptFormModel.useContainer;

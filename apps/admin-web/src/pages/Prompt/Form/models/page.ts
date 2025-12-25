import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PromptApi } from '../../api';

const useContainer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = Number(searchParams.get('id') || 0);
  const { runAsync: handleSubmit, loading } = useRequest(
    async ({ model_params, ...params }: SavePromptRequest) => {
      let parsedModelParams: any | undefined;

      if (model_params) {
        try {
          parsedModelParams = typeof model_params === 'string' ? JSON.parse(model_params) : model_params;
        } catch (error) {
          message.error('模型参数必须是合法的 JSON 格式');
          throw error;
        }
      }

      return id
        ? PromptApi.updatePrompt(id, { ...params, model_params: parsedModelParams })
        : PromptApi.createPrompt({ ...params, model_params: parsedModelParams });
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
    id,
    handleSubmit,
  };
};

export const PromptFormModel = createContainer(useContainer);
export const usePromptFormModel = PromptFormModel.useContainer;

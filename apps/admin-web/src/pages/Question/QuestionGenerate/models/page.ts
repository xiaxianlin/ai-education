import { toast } from '@/components/ui/toast';
import { useLocalStorageState, useRequest } from 'ahooks';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { code } = useParams<{ code: string }>();
  const [inputJson, setInputJson] = useLocalStorageState<string>(`config_${code}`, { defaultValue: '{}' });
  const [promptModalVisible, setPromptModalVisible] = useState(false);

  const {
    loading,
    data: result,
    runAsync: runGenerate,
  } = useRequest(
    () => {
      const params = JSON.parse(inputJson);
      return QuestionApi.generateQuestion(code!, params);
    },
    { manual: true, ready: !!code },
  );

  const {
    loading: promptLoading,
    data: promptContent,
    run: loadPrompt,
  } = useRequest(() => QuestionApi.getQuestionTypePrompt(code!), {
    manual: true,
    ready: !!code,
    onError: (error: any) => {
      toast.error(error?.message || '获取指令失败');
    },
  });

  const handleGenerate = async () => {
    try {
      await runGenerate();
    } catch (error: any) {
      toast.error(error?.message || '生成题目失败，请检查参数 JSON');
    }
  };

  const handleShowPrompt = () => {
    setPromptModalVisible(true);
    if (!promptContent) {
      loadPrompt();
    }
  };

  const handleClosePrompt = () => {
    setPromptModalVisible(false);
  };

  return {
    code,
    result,
    loading,
    inputJson,
    setInputJson,
    handleGenerate,
    promptModalVisible,
    promptContent,
    promptLoading,
    handleShowPrompt,
    handleClosePrompt,
  };
};

export const QuestionGenerateModel = createContainer(useContainer);
export const useQuestionGenerateModel = QuestionGenerateModel.useContainer;

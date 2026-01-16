import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { code } = useParams<{ code: string }>();
  const [inputJson, setInputJson] = useState<string>('{}');
  const [promptModalVisible, setPromptModalVisible] = useState(false);

  const {
    loading,
    data: result,
    runAsync: handleGenerate,
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
      message.error(error?.message || '获取指令失败');
    },
  });

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

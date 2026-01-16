import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { type, code } = useParams<{ type: string; code: string }>();
  const [promptValue, setPromptValue] = useState('');
  const [configsValue, setConfigsValue] = useState('');

  const { loading: typeLoading, refresh: refreshType } = useRequest(() => QuestionApi.getQuestionTypeByCode(code!), {
    ready: !!code && type === 'configs',
    onSuccess: (data) => {
      setConfigsValue(JSON.stringify(data.configs || '{}', null, 2));
    },
  });

  const { loading: promptLoading, refresh: refreshPrompt } = useRequest(
    () => QuestionApi.getQuestionTypePrompt(code!),
    {
      ready: !!code && type === 'prompt',
      onSuccess: setPromptValue,
    },
  );

  // 保存 prompt
  const { run: savePrompt, loading: promptSaving } = useRequest(
    () => QuestionApi.updateQuestionTypePrompt(code!, promptValue),
    {
      manual: true,
      ready: !!code,
      onSuccess: () => {
        message.success('Prompt 保存成功');
        refreshPrompt();
      },
    },
  );

  // 保存 configs
  const { run: saveConfigs, loading: configsSaving } = useRequest(
    () => QuestionApi.updateQuestionTypeConfigs(code!, JSON.parse(configsValue)),
    {
      manual: true,
      ready: !!code,
      onSuccess: () => {
        message.success('Configs 保存成功');
        refreshType();
      },
    },
  );

  const pageTitle = `题型配置 - ${type === 'prompt' ? '提示词' : '配置'}`;

  return {
    type,
    pageTitle,
    promptValue,
    configsValue,
    saving: promptSaving || configsSaving,
    loading: typeLoading || promptLoading,
    savePrompt,
    saveConfigs,
    setPromptValue,
    setConfigsValue,
  };
};

export const QuestionTypeSettingsModel = createContainer(useContainer);
export const useQuestionTypeSettingsModel = QuestionTypeSettingsModel.useContainer;

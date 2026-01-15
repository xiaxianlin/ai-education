import { useRequest } from 'ahooks';
import { message } from 'antd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { type: code } = useParams<{ type: string }>();

  // 加载题型详情（包含 configs）
  const {
    data: questionType,
    loading: loadingType,
    refresh: refreshType,
  } = useRequest(
    () => {
      if (!code) {
        return Promise.resolve(null);
      }
      return QuestionApi.getQuestionTypeByCode(code);
    },
    {
      refreshDeps: [code],
    },
  );

  // 加载 prompt
  const {
    data: prompt,
    loading: loadingPrompt,
    refresh: refreshPrompt,
  } = useRequest(
    () => {
      if (!code) {
        return Promise.resolve('');
      }
      return QuestionApi.getQuestionTypePrompt(code);
    },
    {
      refreshDeps: [code],
    },
  );

  // 保存 prompt
  const { run: savePrompt, loading: savingPrompt } = useRequest(
    async (newPrompt: string) => {
      if (!code) {
        throw new Error('题型编码不能为空');
      }
      await QuestionApi.updateQuestionTypePrompt(code, newPrompt);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('Prompt 保存成功');
        refreshPrompt();
      },
      onError: (error) => {
        message.error(`Prompt 保存失败: ${error.message}`);
      },
    },
  );

  // 保存 configs
  const { run: saveConfigs, loading: savingConfigs } = useRequest(
    async (newConfigs: Record<string, any>) => {
      if (!code) {
        throw new Error('题型编码不能为空');
      }
      await QuestionApi.updateQuestionTypeConfigs(code, newConfigs);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('Configs 保存成功');
        refreshType();
      },
      onError: (error) => {
        message.error(`Configs 保存失败: ${error.message}`);
      },
    },
  );

  // 编辑器状态管理
  const [promptValue, setPromptValue] = useState('');
  const [configsValue, setConfigsValue] = useState('');

  // 初始化 prompt 值
  useEffect(() => {
    if (prompt !== undefined) {
      setPromptValue(prompt);
    }
  }, [prompt]);

  // 初始化 configs 值（转换为 JSON 字符串）
  useEffect(() => {
    if (questionType?.configs !== undefined && questionType?.configs !== null) {
      try {
        setConfigsValue(JSON.stringify(questionType.configs, null, 2));
      } catch (error) {
        setConfigsValue('');
      }
    } else {
      setConfigsValue('');
    }
  }, [questionType?.configs]);

  // 保存 prompt 处理
  const handleSavePrompt = () => {
    savePrompt(promptValue);
  };

  // 保存 configs 处理
  const handleSaveConfigs = () => {
    try {
      // 验证 JSON 格式
      const parsed = configsValue.trim() ? JSON.parse(configsValue) : {};
      saveConfigs(parsed);
    } catch (error) {
      message.error('Configs 格式错误，请检查 JSON 语法');
    }
  };

  const loading = loadingType || loadingPrompt;
  const pageTitle = `题型配置 - ${questionType?.name || code || ''}`;

  return {
    code,
    questionType,
    loading,
    loadingType,
    loadingPrompt,
    // Prompt 相关
    prompt: prompt || '',
    promptValue,
    setPromptValue,
    savingPrompt,
    handleSavePrompt,
    // Configs 相关
    configs: questionType?.configs || null,
    configsValue,
    setConfigsValue,
    savingConfigs,
    handleSaveConfigs,
    // 页面标题
    pageTitle,
  };
};

export const QuestionTypeSettingsModel = createContainer(useContainer);
export const useQuestionTypeSettingsModel = QuestionTypeSettingsModel.useContainer;

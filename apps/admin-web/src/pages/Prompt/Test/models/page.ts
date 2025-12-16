import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { Form, message } from 'antd';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const { version_id } = useParams();
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestPromptResponse | null>(null);
  const [testForm] = Form.useForm();

  useEffect(() => {
    if (version_id) {
      loadPrompt(Number(version_id));
    }
  }, [version_id]);

  const loadPrompt = async (versionId: number) => {
    setLoading(true);
    try {
      const data = await adminApi.getPromptDetail(versionId);
      setPrompt(data);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!prompt || !version_id) return;
    const values = await testForm.validateFields();
    setLoading(true);
    try {
      // 注意：测试接口可能需要调整，这里暂时注释
      // 根据 API 文档，测试接口可能需要 prompt_id 和 version_id
      // 但新 API 可能没有测试接口，需要确认
      message.warning('测试功能暂未实现，请查看 API 文档确认测试接口');
      // const result = await adminApi.testPromptVersion(prompt.id, Number(version_id), {
      //   variables: values.variables ? JSON.parse(values.variables) : {},
      //   model_provider: values.model_provider,
      //   model_name: values.model_name,
      // });
      // setTestResult(result);
      // message.success('测试完成');
    } catch (error: any) {
      message.error(error?.message || '测试失败');
    } finally {
      setLoading(false);
    }
  };

  return {
    prompt,
    loading,
    testForm,
    testResult,
    handleTest,
  };
};

export const PromptTestModel = createContainer(useContainer);
export const usePromptTestModel = PromptTestModel.useContainer;


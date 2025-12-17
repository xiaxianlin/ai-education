import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { Form, message } from 'antd';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const [searchParams] = useSearchParams();
  const version_id = searchParams.get('version_id');
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
      
      // 如果有默认的模型参数，设置到表单
      if (data.model_params) {
        testForm.setFieldsValue({
          model_provider: 'aliyun',
          model_name: data.model_params.model_name || 'qwen-plus',
          model_params: {
            temperature: data.model_params.temperature || 0.7,
            max_tokens: data.model_params.max_tokens,
          },
        });
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (values: any) => {
    if (!prompt || !version_id) return;
    
    setLoading(true);
    setTestResult(null);
    
    try {
      // 解析 JSON 变量
      let variables = {};
      if (values.variables) {
        try {
          variables = JSON.parse(values.variables);
        } catch (e) {
          message.error('变量格式错误，请输入合法的 JSON');
          setLoading(false);
          return;
        }
      }
      
      const result = await adminApi.testPrompt(Number(version_id), {
        variables,
        model_provider: values.model_provider,
        model_name: values.model_name,
        model_params: values.model_params || {},
      });
      
      setTestResult(result);
      
      if (result.status === 'success') {
        message.success('测试完成');
      } else {
        message.error(result.error || '测试失败');
      }
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


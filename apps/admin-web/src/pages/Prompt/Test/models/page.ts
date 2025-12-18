import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { Form } from 'antd';
import { adminApi } from '@/lib/api';
import { extractTemplateParameters, TemplateParameter } from '../utils/templateParser';
import { ModelConfig } from '../views/ModelDrawer';
import { useAntdApp } from '@/lib/antdApp';

const useContainer = () => {
  const { message } = useAntdApp();
  const [searchParams] = useSearchParams();
  const version_id = searchParams.get('version_id');
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestPromptResponse | null>(null);
  const [testForm] = Form.useForm();

  // 新增状态
  const [parameters, setParameters] = useState<TemplateParameter[]>([]);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [generationType, setGenerationType] = useState<string>('text');
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    model_provider: 'aliyun',
    model_name: 'qwen-plus',
    model_params: {
      temperature: 0.7,
    },
  });

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

      // 解析模板参数
      if (data.template_content) {
        const extractedParams = extractTemplateParameters(data.template_content);
        setParameters(extractedParams);

        // 初始化参数值
        const initialValues: Record<string, any> = {};
        extractedParams.forEach(param => {
          initialValues[param.name] = '';
        });
        setParameterValues(initialValues);
      }

      // 设置默认模型配置
      if (data.model_params) {
        const newModelConfig: ModelConfig = {
          model_provider: 'aliyun',
          model_name: data.model_params.model_name || 'qwen-plus',
          model_params: {
            temperature: data.model_params.temperature || 0.7,
            max_tokens: data.model_params.max_tokens,
          },
        };
        setModelConfig(newModelConfig);

        testForm.setFieldsValue({
          model_provider: newModelConfig.model_provider,
          model_name: newModelConfig.model_name,
          model_params: newModelConfig.model_params,
        });
      }
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 参数值变化处理
  const handleParameterValuesChange = (newValues: Record<string, any>) => {
    setParameterValues(newValues);
  };

  // 模型配置变化处理
  const handleModelConfigChange = (newConfig: ModelConfig) => {
    setModelConfig(newConfig);

    // 同步到测试表单
    testForm.setFieldsValue({
      model_provider: newConfig.model_provider,
      model_name: newConfig.model_name,
      model_params: newConfig.model_params,
    });
  };

  const handleTest = async (_values: TestPromptRequest) => {
    if (!prompt || !version_id) return;

    setLoading(true);
    setTestResult(null);

    try {
      // 使用参数值和模型配置进行测试
      const result = await adminApi.testPrompt(Number(version_id), {
        variables: parameterValues,
        model_provider: modelConfig.model_provider,
        model_name: modelConfig.model_name,
        model_params: modelConfig.model_params || {},
        generation_type: generationType,
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
    parameters,
    parameterValues,
    generationType,
    modelConfig,
    handleTest,
    handleParameterValuesChange,
    setGenerationType,
    handleModelConfigChange,
  };
};

export const PromptTestModel = createContainer(useContainer);
export const usePromptTestModel = PromptTestModel.useContainer;

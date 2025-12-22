import { useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Spin, Flex } from 'antd';
import { usePromptTestModel } from '../models/page';
import TemplateContent from './TemplateContent';
import ParameterInfo from './ParameterInfo';
import ModelInfo from './ModelInfo';
import { TestForm } from './TestForm';

export default function MainView() {
  const {
    prompt,
    loading,
    testForm,
    testResult,
    handleTest,
    parameters,
    parameterValues,
    generationType,
    modelConfig,
    handleParameterValuesChange,
    setGenerationType,
    handleModelConfigChange,
  } = usePromptTestModel();

  const requiredParamsSet = useMemo(() => {
    if (!parameters || parameters.length === 0) {
      return true;
    }

    const values = parameterValues || {};

    return parameters.every((param) => {
      if (!param.required) return true;
      const value = values[param.name];
      return value !== undefined && value !== null && value !== '';
    });
  }, [parameters, parameterValues]);

  if (loading && !prompt) {
    return (
      <PageContainer title="加载中...">
        <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
      </PageContainer>
    );
  }

  if (!prompt) {
    return <PageContainer title="提示词不存在" />;
  }

  return (
    <PageContainer title={`提示词测试：${prompt.name}`}>
      <Flex gap={24} align="flex-start" style={{ marginTop: 16 }}>
        {/* 左侧：模板内容 + 参数配置 */}
        <Flex vertical gap={24} style={{ flex: 1, minWidth: 0 }}>
          <TemplateContent
            content={prompt.template_content || ''}
            generationType={generationType}
            onGenerationTypeChange={(type: string) => setGenerationType(type as GenerateType)}
          />
          <ParameterInfo
            parameters={parameters}
            values={parameterValues}
            onParametersChange={handleParameterValuesChange}
          />
        </Flex>

        {/* 右侧：模型配置 + 运行测试 */}
        <Flex vertical gap={24} style={{ flex: 1, minWidth: 0 }}>
          <ModelInfo config={modelConfig} onConfigChange={handleModelConfigChange} />
          <TestForm
            form={testForm}
            loading={loading}
            result={testResult}
            onTest={handleTest}
            requiredParamsSet={requiredParamsSet}
          />
        </Flex>
      </Flex>
    </PageContainer>
  );
}

import { useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Spin } from 'antd';
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
    modelConfig,
    handleParameterValuesChange,
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
      {/* 模板内容模块 */}
      <TemplateContent content={prompt.template_content || ''} />

      {/* 参数信息模块（组件内部会在无参数时自动隐藏） */}
      <ParameterInfo
        parameters={parameters}
        values={parameterValues}
        onParametersChange={handleParameterValuesChange}
      />

      {/* 模型信息模块 */}
      <ModelInfo
        config={modelConfig}
        onConfigChange={handleModelConfigChange}
      />

      {/* 测试表单和结果 */}
      <TestForm
        form={testForm}
        loading={loading}
        result={testResult}
        onTest={handleTest}
        requiredParamsSet={requiredParamsSet}
      />
    </PageContainer>
  );
}

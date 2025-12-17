import { useMemo } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Descriptions, Divider, Spin } from 'antd';
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
      <ProCard
        split="vertical"
        bordered
        gutter={16}
        style={{ marginTop: 16, minHeight: 'calc(100vh - 220px)' }}
      >
        {/* 左侧：规则 / 模板内容 + 输入配置 */}
        <ProCard
          colSpan="60%"
          ghost
          direction="column"
          bodyStyle={{ paddingRight: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* 模板内容（规则） */}
          <TemplateContent content={prompt.template_content || ''} />

          {/* 输入配置：参数 + 模型 */}
          <ProCard title="输入配置" bordered headerBordered>
            <ParameterInfo
              parameters={parameters}
              values={parameterValues}
              onParametersChange={handleParameterValuesChange}
            />

            <Divider style={{ margin: '12px 0' }} />

            <ModelInfo
              config={modelConfig}
              onConfigChange={handleModelConfigChange}
            />
          </ProCard>

        </ProCard>

        {/* 右侧：仅运行与结果 */}
        <ProCard
          colSpan="40%"
          ghost
          direction="column"
          bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <TestForm
            form={testForm}
            loading={loading}
            result={testResult}
            onTest={handleTest}
            requiredParamsSet={requiredParamsSet}
          />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}

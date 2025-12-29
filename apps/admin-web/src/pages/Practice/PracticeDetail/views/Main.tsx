import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Collapse, Space } from 'antd';
import { usePracticeDetailModel } from '../models/page';
import { BaseInfo } from './BaseInfo';
import { ConfigInfo } from './ConfigInfo';
import { ParameterInfo } from './ParameterInfo';
import { PromptInfo } from './PromptInfo';

export default function MainView() {
  const { detail, loading, handleEdit, handleBack } = usePracticeDetailModel();

  return (
    <PageContainer
      title="练习详情"
      header={{
        onBack: handleBack,
        breadcrumb: {},
      }}
      extra={
        <Space>
          <Button type="primary" onClick={handleEdit}>
            编辑
          </Button>
        </Space>
      }
    >
      <Card loading={loading}>
        {detail && (
          <Collapse
            activeKey={['basic', 'prompt', 'parameter', 'config']}
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: <BaseInfo detail={detail} />,
              },
              {
                key: 'prompt',
                label: '提示词',
                children: <PromptInfo prompt={detail.prompt} />,
              },
              {
                key: 'parameter',
                label: '参数',
                children: <ParameterInfo parameterConfig={detail.parameter_config} />,
              },
              {
                key: 'config',
                label: '配置',
                children: <ConfigInfo detail={detail} />,
              },
            ]}
          />
        )}
      </Card>
    </PageContainer>
  );
}

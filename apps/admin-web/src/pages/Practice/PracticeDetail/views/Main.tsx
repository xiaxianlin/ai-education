import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Card, Collapse, Flex } from 'antd';
import { usePracticeDetailModel } from '../models/page';
import { BaseInfo } from './BaseInfo';
import { ConfigInfo } from './ConfigInfo';
import { ParameterInfo } from './ParameterInfo';
import { PromptInfo } from './PromptInfo';

export default function MainView() {
  const { detail, loading, handleEdit, handleBack, deleting, handleDelete } = usePracticeDetailModel();

  return (
    <PageContainer
      title="练习详情"
      header={{
        onBack: handleBack,
        breadcrumb: {},
      }}
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
      <FooterToolbar className="page-footer">
        <Flex justify="center" gap={16}>
          <Button size="large" onClick={handleBack}>
            返回
          </Button>
          <Button size="large" type="primary" onClick={handleEdit}>
            编辑
          </Button>
          <Button size="large" danger loading={deleting} onClick={handleDelete}>
            删除
          </Button>
        </Flex>
      </FooterToolbar>
    </PageContainer>
  );
}

import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Card, Collapse, Flex, Form } from 'antd';
import { usePracticeFormModel } from '../models/page';
import { BaseForm } from './BaseForm';
import { ConfigForm } from './ConfigForm';
import { ParameterForm } from './ParameterForm';
import { PromptForm } from './PromptForm';

export default function MainView() {
  const { form, isEdit, isClone, navigate, fetchingDetails, submitting, handleSubmit } = usePracticeFormModel();

  const getTitle = () => {
    if (isClone) return '复制练习';
    if (isEdit) return '编辑练习';
    return '新建练习';
  };

  return (
    <PageContainer title={getTitle()} header={{ onBack: () => navigate('/practice') }}>
      <Card loading={fetchingDetails}>
        <Form form={form} size="large" onFinish={handleSubmit} disabled={submitting}>
          <Collapse
            activeKey={['basic', 'prompt', 'parameter', 'config']}
            items={[
              {
                key: 'basic',
                label: '基本信息',
                children: <BaseForm />,
              },
              {
                key: 'prompt',
                label: '提示词',
                children: <PromptForm />,
              },
              {
                key: 'parameter',
                label: '参数',
                children: <ParameterForm />,
              },
              {
                key: 'config',
                label: '配置',
                children: <ConfigForm />,
              },
            ]}
          />
          <FooterToolbar className="page-footer">
            <Flex justify="center" gap={16}>
              <Button size="large" onClick={() => navigate('/practice')}>
                取消
              </Button>
              <Button type="primary" size="large" loading={submitting} onClick={() => form.submit()}>
                保存
              </Button>
            </Flex>
          </FooterToolbar>
        </Form>
      </Card>
    </PageContainer>
  );
}

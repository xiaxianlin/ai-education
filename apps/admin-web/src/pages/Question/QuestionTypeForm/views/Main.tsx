import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Card, Collapse, Flex, Form } from 'antd';
import { useQuestionTypeFormModel } from '../models/page';
import { BaseForm } from './BaseForm';
import { ConfigForm } from './ConfigForm';
import { PromptForm } from './PromptForm';

export default function MainView() {
  const { form, isEdit, navigate, fetchingDetails, submitting, handleSubmit } = useQuestionTypeFormModel();

  return (
    <PageContainer
      title={isEdit ? '编辑题型' : '新增题型'}
      header={{
        onBack: () => navigate('/question_type'),
        breadcrumb: {},
      }}
    >
      <Card loading={fetchingDetails}>
        <Form form={form} size="large" onFinish={handleSubmit} disabled={submitting}>
          <Collapse
            activeKey={['basic', 'prompt', 'config']}
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
                key: 'config',
                label: '配置信息',
                children: <ConfigForm />,
              },
            ]}
          />
          <FooterToolbar className="page-footer">
            <Flex justify="center" gap={16}>
              <Button size="large" onClick={() => navigate('/question_type')}>
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


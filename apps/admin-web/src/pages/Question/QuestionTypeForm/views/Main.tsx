import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Card, Flex, Form } from 'antd';
import { useQuestionTypeFormModel } from '../models/page';
import { AbilityForm } from './AbilityForm';
import { UnitForm } from './UnitForm';

export default function MainView() {
  const { form, isEdit, type, navigate, fetchingDetails, submitting, handleSubmit } = useQuestionTypeFormModel();

  // 根据 type 动态显示标题
  const title = isEdit
    ? type === 'unit'
      ? '编辑单元练习'
      : '编辑能力练习'
    : type === 'unit'
      ? '新增单元练习'
      : '新增能力练习';

  return (
    <PageContainer
      title={title}
      header={{
        onBack: () => navigate('/question_type'),
        breadcrumb: {},
      }}
    >
      <Card loading={fetchingDetails}>
        <Form form={form} size="large" onFinish={handleSubmit} disabled={submitting} labelCol={{ span: 2 }} labelAlign="left">
          {type === 'unit' ? <UnitForm /> : <AbilityForm />}
          <FooterToolbar className="page-footer">
            <Flex justify="center" gap={16}>
              <Button size="large" onClick={() => navigate(-1)}>
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


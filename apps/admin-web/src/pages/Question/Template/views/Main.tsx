import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Flex, Select } from 'antd';
import { QuestionTemplateModel, useQuestionTemplateModel } from '../models/page';
import FormView from './Form';
import TableView from './Table';

function MainContent() {
  const { questionTypeId, setQuestionTypeId, questionTypes, showForm, refresh } = useQuestionTemplateModel();

  return (
    <PageContainer
      title="题型模板管理"
      header={{ breadcrumb: {} }}
      extra={
        <Flex gap={12}>
          <Select
            allowClear
            placeholder="按题型筛选"
            style={{ width: 200 }}
            value={questionTypeId}
            onChange={setQuestionTypeId}
            options={questionTypes?.map((t) => ({ value: t.id, label: t.name }))}
          />
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showForm()}>
            新增模板
          </Button>
          <Button size="large" icon={<ReloadOutlined />} onClick={refresh}>
            刷新
          </Button>
        </Flex>
      }
    >
      <TableView />
      <FormView />
    </PageContainer>
  );
}

export default function MainView() {
  return (
    <QuestionTemplateModel.Provider>
      <MainContent />
    </QuestionTemplateModel.Provider>
  );
}

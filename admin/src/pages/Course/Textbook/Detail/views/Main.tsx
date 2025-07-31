import { PageContainer } from '@ant-design/pro-components';
import { TextbookForm } from '@/components/view';
import { useTextbookDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { Footer } from './Footer';
import { Tabs } from 'antd';
import { UnitView } from './Unit';
import { KnowledgeView } from './Knowledge';

export default function MainView() {
  const { loading, formProps } = useTextbookDetailModel();
  return (
    <PageContainer
      loading={loading}
      header={{ title: '' }}
      footer={[]}
      footerToolBarProps={{ renderContent: () => <Footer /> }}
    >
      <BasicInfo />
      <div className="mt-3 bg-white px-3 rounded-md">
        <Tabs
          defaultActiveKey="knowledge"
          items={[
            { label: '单元管理', key: 'unit', children: <UnitView /> },
            { label: '知识点管理', key: 'knowledge', children: <KnowledgeView /> },
          ]}
        />
      </div>

      <TextbookForm {...formProps} />
    </PageContainer>
  );
}

import { PageContainer } from '@ant-design/pro-components';
import { useTextbookDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { Footer } from './Footer';
import { Spin, Tabs } from 'antd';
import { UnitView } from './Unit';
import { KnowledgeView } from './Knowledge';
import { TextbookUnitModel } from '../models/unit';
import { TextbookKnowledgeModel } from '../models/knowledge';
import { useMemo } from 'react';

export default function MainView() {
  const { loading, parsing, uploading } = useTextbookDetailModel();

  const spinTip = useMemo(() => {
    if (parsing) {
      return '教材解析时间较长，一般在 30s 左右，请耐心等候';
    }
    if (uploading) {
      return '上传中...';
    }
  }, [parsing, uploading]);
  return (
    <PageContainer
      loading={loading}
      header={{ title: '教材详情', breadcrumb: {} }}
      footer={[]}
      footerToolBarProps={{ renderContent: () => <Footer /> }}
    >
      <BasicInfo />
      <div className="mt-3 bg-white px-3 rounded-md">
        <Tabs
          defaultActiveKey="unit"
          items={[
            {
              label: '单元管理',
              key: 'unit',
              children: (
                <TextbookUnitModel.Provider>
                  <UnitView />
                </TextbookUnitModel.Provider>
              ),
            },
            {
              label: '知识点管理',
              key: 'knowledge',
              children: (
                <TextbookKnowledgeModel.Provider>
                  {' '}
                  <KnowledgeView />
                </TextbookKnowledgeModel.Provider>
              ),
            },
          ]}
        />
      </div>
      <Spin fullscreen size="large" spinning={parsing || uploading} tip={spinTip} />
    </PageContainer>
  );
}

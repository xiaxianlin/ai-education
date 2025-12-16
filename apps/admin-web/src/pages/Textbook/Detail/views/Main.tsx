import { PageContainer } from '@ant-design/pro-components';
import { useTextbookDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { Space, Spin, Tabs } from 'antd';
import { UnitView } from './Unit';
import { KnowledgeView } from './Knowledge';
import { TextbookUnitModel } from '../models/unit';
import { TextbookKnowledgeModel } from '../models/knowledge';
import { useMemo } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { UploadButton } from '@/components/ui';

export default function MainView() {
  const navigate = useNavigate();
  const { loading, parsing, uploading, textbook, upload, handleParse, handleDelete } = useTextbookDetailModel();

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
      header={{
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ padding: 0, height: 'auto' }}
            />
            <span>教材详情</span>
          </div>
        ),
        breadcrumb: {},
        extra: [
          <Button key="parse" type="primary" disabled={!textbook?.file} loading={parsing} onClick={handleParse}>
            解析
          </Button>,
          <UploadButton key="upload" type="primary" disabled={!textbook} action={upload}>
            上传
          </UploadButton>,
          <Button key="delete" danger onClick={handleDelete}>
            删除
          </Button>,
        ],
      }}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        <BasicInfo />
        <Tabs
          type="card"
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
                  <KnowledgeView />
                </TextbookKnowledgeModel.Provider>
              ),
            },
          ]}
        />
      </Space>
      <Spin fullscreen size="large" spinning={parsing || uploading} tip={spinTip} />
    </PageContainer>
  );
}

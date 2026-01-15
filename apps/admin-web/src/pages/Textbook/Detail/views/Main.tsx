import { UploadButton } from '@/components';
import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Space, Spin } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTextbookDetailModel } from '../models/page';
import { TextbookUnitModel } from '../models/unit';
import { BasicInfo } from './BasicInfo';
import { UnitView } from './Unit';

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
    <PageContainer loading={loading} title="教材详情" header={{ onBack: () => navigate(-1) }}>
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        <BasicInfo />
        <TextbookUnitModel.Provider>
          <UnitView />
        </TextbookUnitModel.Provider>
      </Space>
      <FooterToolbar className="page-footer">
        <Button
          key="parse"
          size="large"
          type="primary"
          disabled={!textbook?.file}
          loading={parsing}
          onClick={handleParse}
        >
          解析
        </Button>
        <UploadButton key="upload" size="large" type="primary" disabled={!textbook} action={upload}>
          上传
        </UploadButton>
        <Button key="delete" size="large" danger onClick={handleDelete}>
          删除
        </Button>
      </FooterToolbar>
      <Spin fullscreen size="large" spinning={parsing || uploading} tip={spinTip} />
    </PageContainer>
  );
}

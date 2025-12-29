import { UploadButton } from '@/components';
import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { Button, Spin } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherBookDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';

export default function MainView() {
  const navigate = useNavigate();
  const { loading, uploading, teacherBook, upload, handleDelete } = useTeacherBookDetailModel();

  const spinTip = useMemo(() => {
    if (uploading) {
      return '上传中...';
    }
  }, [uploading]);
  return (
    <PageContainer loading={loading} title="教师用书详情" header={{ onBack: () => navigate(-1) }}>
      <BasicInfo />
      <FooterToolbar className="page-footer">
        <UploadButton key="upload" size="large" type="primary" disabled={!teacherBook} action={upload}>
          上传
        </UploadButton>
        <Button key="delete" size="large" danger onClick={handleDelete}>
          删除
        </Button>
      </FooterToolbar>
      <Spin fullscreen size="large" spinning={uploading} tip={spinTip} />
    </PageContainer>
  );
}

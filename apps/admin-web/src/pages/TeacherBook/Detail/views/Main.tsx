import { PageContainer } from '@ant-design/pro-components';
import { useTeacherBookDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { Spin } from 'antd';
import { useMemo } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { UploadButton } from '@/components/ui';

export default function MainView() {
  const navigate = useNavigate();
  const { loading, uploading, teacherBook, upload, handleDelete } = useTeacherBookDetailModel();

  const spinTip = useMemo(() => {
    if (uploading) {
      return '上传中...';
    }
  }, [uploading]);
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
            <span>教师用书详情</span>
          </div>
        ),
        breadcrumb: {},
        extra: [
          <UploadButton key="upload" type="primary" disabled={!teacherBook} action={upload}>
            上传
          </UploadButton>,
          <Button key="delete" danger onClick={handleDelete}>
            删除
          </Button>,
        ],
      }}
    >
      <BasicInfo />
      <Spin fullscreen size="large" spinning={uploading} tip={spinTip} />
    </PageContainer>
  );
}

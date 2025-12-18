import { PageContainer } from '@ant-design/pro-components';
import { useTeacherBookDetailModel } from '../models/page';
import { BasicInfo } from './BasicInfo';
import { Flex, Spin } from 'antd';
import { useMemo } from 'react';
import { Button } from 'antd';
import { UploadButton } from '@/components';
import { PageHeader } from '@/components';

export default function MainView() {
  const { loading, uploading, teacherBook, upload, handleDelete } = useTeacherBookDetailModel();

  const spinTip = useMemo(() => {
    if (uploading) {
      return '上传中...';
    }
  }, [uploading]);
  return (
    <PageContainer
      loading={loading}
      title={<PageHeader title="教师用书详情" />}
      header={{
        breadcrumb: {},
        extra: [],
      }}
      footer={[
        <Flex align="center" gap={8} style={{ padding: '16px 0' }}>
          <UploadButton key="upload" size="large" type="primary" disabled={!teacherBook} action={upload}>
            上传
          </UploadButton>
          <Button key="delete" size="large" danger onClick={handleDelete}>
            删除
          </Button>
        </Flex>,
      ]}
    >
      <BasicInfo />
      <Spin fullscreen size="large" spinning={uploading} tip={spinTip} />
    </PageContainer>
  );
}

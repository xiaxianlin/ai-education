import ResultView from '../Result';
import { useQuestionResolveModel } from '../../models/page';
import { PageContainer } from '@ant-design/pro-components';
import { Button } from 'antd';
import { ProfileForm } from '../Form';
import UploadView from '../Upload';
export default function MainView() {
  const { loading, show } = useQuestionResolveModel();
  return (
    <PageContainer
      fixedHeader
      header={{
        breadcrumb: {},
        extra: [
          <Button key="1" loading={loading} type="primary" onClick={show}>
            设置信息
          </Button>,
          <UploadView key="upload" />,
        ],
      }}
    >
      <ResultView />
      <ProfileForm />
    </PageContainer>
  );
}

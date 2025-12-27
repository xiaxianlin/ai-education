import { ListView } from './List';
import { PageContainer } from '@ant-design/pro-components';
import { SubjectGradeTabs } from '@/components';
import { QuestionPreviewModal } from '../components/QuestionPreviewModal';
import { useQuestionListModel } from '../models/page';

export default function MainView() {
  const { previewQuestion, previewOpen, handleClosePreview } = useQuestionListModel();
  return (
    <PageContainer title="题目管理" header={{ breadcrumb: {} }}>
      <SubjectGradeTabs />
      <ListView />
      {/* 题目预览模态框 */}
      <QuestionPreviewModal question={previewQuestion} open={previewOpen} onClose={handleClosePreview} />
    </PageContainer>
  );
}

import { SubjectGradeTabs } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import { useAbilityModel } from '../models/page';
import AbilityForm from './AbilityForm';
import AbilityList from './AbilityList';

export default function MainView() {
  const {
    subject,
    selectedGrade,
    handleSubjectChange,
    handleGradeChange,
  } = useAbilityModel();

  return (
    <PageContainer title="能力管理">
      <SubjectGradeTabs
        subject={subject}
        grade={selectedGrade}
        setSubject={handleSubjectChange}
        setGrade={handleGradeChange}
      />
      <AbilityList />
      <AbilityForm />
    </PageContainer>
  );
}

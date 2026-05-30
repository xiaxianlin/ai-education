import { SubjectGradeTabs } from '@/components';
import { PageShell } from '@/components/ui';
import { useAbilityModel } from '../models/page';
import AbilityForm from './AbilityForm';
import AbilityList from './AbilityList';

export default function MainView() {
  const { subject, grade, setSubject, setGrade } = useAbilityModel();

  return (
    <PageShell title="能力管理" description="维护学科年级下的能力点、难度和状态。">
      <SubjectGradeTabs subject={subject} grade={grade} setSubject={setSubject} setGrade={setGrade} />
      <AbilityList />
      <AbilityForm />
    </PageShell>
  );
}

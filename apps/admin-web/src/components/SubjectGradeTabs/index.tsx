import { GRADES } from '@/constants/course';
import { useConfigs } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { Radio, Tabs } from 'antd';

interface SubjectGradeTabsProps {
  subject?: string;
  grade?: number;
  setSubject?: (subject: string) => void;
  setGrade?: (grade: number) => void;
}

export function SubjectGradeTabs(props: SubjectGradeTabsProps) {
  const initialState = useInitialStateModel();
  const { subjects } = useConfigs();

  const activeSubject = props.subject ?? initialState.subject;
  const activeGrade = props.grade ?? initialState.grade;
  const onSubjectChange = props.setSubject ?? initialState.setSubject;
  const onGradeChange = props.setGrade ?? initialState.setGrade;

  return (
    <>
      <Radio.Group
        block
        size="large"
        buttonStyle="solid"
        optionType="button"
        style={{ marginBottom: 16 }}
        value={activeGrade}
        onChange={(e) => onGradeChange(e.target.value)}
        options={Object.keys(GRADES).map((grade) => ({ value: Number(grade), label: GRADES[Number(grade)] }))}
      />
      <Tabs
        type="card"
        onChange={onSubjectChange}
        activeKey={activeSubject}
        items={subjects.map((subject) => ({ label: subject, key: subject }))}
      />
    </>
  );
}

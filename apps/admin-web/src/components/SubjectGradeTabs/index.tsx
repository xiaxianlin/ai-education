import { useConfigs } from '@/hooks';
import { Tabs, Radio } from 'antd';
import { GRADES } from '@/constants/course';

interface SubjectGradeTabsProps {
  subject: string;
  grade: number;
  setSubject: (subject: string) => void;
  setGrade: (grade: number) => void;
}

export function SubjectGradeTabs({ subject, grade, setSubject, setGrade }: SubjectGradeTabsProps) {
  const { subjects } = useConfigs();
  return (
    <>
      <Tabs
        type="card"
        onChange={setSubject}
        activeKey={subject}
        items={subjects.map((subject) => ({ label: subject, key: subject }))}
        classNames={{ item: 'large-tab-item' }}
      />
      <Radio.Group
        block
        size="large"
        buttonStyle="solid"
        optionType="button"
        style={{ marginBottom: 16 }}
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        options={Object.keys(GRADES).map((grade) => ({ value: Number(grade), label: GRADES[Number(grade)] }))}
      />
    </>
  );
}

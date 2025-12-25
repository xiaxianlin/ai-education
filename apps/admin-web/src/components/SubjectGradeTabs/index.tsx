import { GRADES } from '@/constants/course';
import { useConfigs } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { Radio, Tabs } from 'antd';

export function SubjectGradeTabs() {
  const { subject, grade, setSubject, setGrade } = useInitialStateModel();
  const { subjects } = useConfigs();
  return (
    <>
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
      <Tabs
        type="card"
        onChange={setSubject}
        activeKey={subject}
        items={subjects.map((subject) => ({ label: subject, key: subject }))}
        classNames={{ item: 'large-tab-item' }}
      />
    </>
  );
}

import { useConfigs } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { GRADES } from '@ai-education/shared-web';
import { Flex, Radio } from 'antd';

interface SubjectGradeTabsProps {
  subject?: string;
  grade?: number;
  showGrade?: boolean;
  setSubject?: (subject: string) => void;
  setGrade?: (grade: number) => void;
  subjects?: string[]; // 支持传入过滤后的科目列表
}

export function SubjectGradeTabs({ showGrade = true, subjects: customSubjects, ...props }: SubjectGradeTabsProps) {
  const initialState = useInitialStateModel();
  const { subjects: defaultSubjects } = useConfigs();
  
  // 如果传入了自定义科目列表，使用自定义的；否则使用默认的
  const subjects = customSubjects ?? defaultSubjects;

  const activeSubject = props.subject ?? initialState.subject;
  const activeGrade = props.grade ?? initialState.grade;
  const onSubjectChange = props.setSubject ?? initialState.setSubject;
  const onGradeChange = props.setGrade ?? initialState.setGrade;

  return (
    <Flex vertical gap={16} className="mb-4">
      <Radio.Group
        size="large"
        buttonStyle="solid"
        optionType="button"
        value={activeSubject}
        className="large-tab-item"
        onChange={(e) => onSubjectChange(e.target.value)}
        options={subjects.map((subject) => ({ value: subject, label: subject }))}
      />
      {showGrade && (
        <Radio.Group
          block
          size="large"
          buttonStyle="solid"
          optionType="button"
          value={activeGrade}
          onChange={(e) => onGradeChange(e.target.value)}
          options={Object.keys(GRADES).map((grade) => ({ value: Number(grade), label: GRADES[Number(grade)] }))}
        />
      )}
    </Flex>
  );
}

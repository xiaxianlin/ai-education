import { useConfigs } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { classNames } from '@/components/ui';
import { GRADES } from '@ai-education/shared-web';

interface SubjectGradeTabsProps {
  subject?: string;
  grade?: number;
  showGrade?: boolean;
  setSubject?: (subject: string) => void;
  setGrade?: (grade: number) => void;
  subjects?: string[];
}

export function SubjectGradeTabs({ showGrade = true, subjects: customSubjects, ...props }: SubjectGradeTabsProps) {
  const initialState = useInitialStateModel();
  const { subjects: defaultSubjects } = useConfigs();
  const subjects = customSubjects ?? defaultSubjects;
  const activeSubject = props.subject ?? initialState.subject;
  const activeGrade = props.grade ?? initialState.grade;
  const onSubjectChange = props.setSubject ?? initialState.setSubject;
  const onGradeChange = props.setGrade ?? initialState.setGrade;

  const getTabClass = (active: boolean) =>
    classNames(
      'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors',
      active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    );

  return (
    <div className="mb-4 grid gap-3">
      <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {subjects.map((subject) => (
          <button key={subject} type="button" className={getTabClass(subject === activeSubject)} onClick={() => onSubjectChange(subject)}>
            {subject}
          </button>
        ))}
      </div>
      {showGrade ? (
        <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {Object.keys(GRADES).map((grade) => {
            const gradeValue = Number(grade);
            return (
              <button key={grade} type="button" className={getTabClass(gradeValue === activeGrade)} onClick={() => onGradeChange(gradeValue)}>
                {GRADES[gradeValue]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

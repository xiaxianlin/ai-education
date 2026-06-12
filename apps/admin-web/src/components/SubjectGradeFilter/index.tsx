import { Button, Card, CardContent, Field, Select } from '@/components/ui';
import { useConfigs } from '@/hooks';
import { GRADES } from '@ai-education/shared-web';
import { RotateCcw } from 'lucide-react';

interface SubjectGradeFilterProps {
  subject?: string;
  grade?: number;
  setSubject: (subject: string) => void;
  setGrade: (grade: number) => void;
}

export function SubjectGradeFilter({ subject, grade, setSubject, setGrade }: SubjectGradeFilterProps) {
  const { subjects } = useConfigs();
  const gradeOptions = Object.keys(GRADES).map((key) => Number(key));

  const resetFilter = () => {
    if (subjects[0]) {
      setSubject(subjects[0]);
    }
    if (gradeOptions[0]) {
      setGrade(gradeOptions[0]);
    }
  };

  return (
    <Card>
      <CardContent className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <Field label="学科">
          <Select value={subject || ''} onChange={(event) => setSubject(event.target.value)}>
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="年级">
          <Select value={grade || ''} onChange={(event) => setGrade(Number(event.target.value))}>
            {gradeOptions.map((item) => (
              <option key={item} value={item}>
                {GRADES[item]}
              </option>
            ))}
          </Select>
        </Field>
        <Button variant="outline" icon={<RotateCcw className="size-4" />} onClick={resetFilter}>
          重置
        </Button>
      </CardContent>
    </Card>
  );
}

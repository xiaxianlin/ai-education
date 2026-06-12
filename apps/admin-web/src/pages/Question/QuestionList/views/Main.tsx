import { Button, Card, CardContent, Field, Input, PageShell, Select } from '@/components/ui';
import { useConfigs } from '@/hooks';
import { GRADES } from '@ai-education/shared-web';
import { RotateCcw } from 'lucide-react';
import { useQuestionListModel } from '../models/page';
import { DetailView } from './Detail';
import { QuestionFormModal } from './Form';
import { ListView } from './List';

export default function MainView() {
  const { subjects } = useConfigs();
  const {
    subject,
    grade,
    setSubject,
    setGrade,
    questionId,
    questionName,
    setQuestionId,
    setQuestionName,
  } = useQuestionListModel();
  const gradeOptions = Object.keys(GRADES).map((key) => Number(key));

  const resetFilter = () => {
    if (subjects[0]) {
      setSubject(subjects[0]);
    }
    if (gradeOptions[0]) {
      setGrade(gradeOptions[0]);
    }
    setQuestionId('');
    setQuestionName('');
  };

  return (
    <PageShell title="题目管理" description="按学科与年级检索、查看和维护已生成题目。">
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            <Field label="题目 ID">
              <Input value={questionId} placeholder="按题目 ID 筛选" onChange={(event) => setQuestionId(event.target.value)} />
            </Field>
            <Field label="名称">
              <Input value={questionName} placeholder="按名称筛选" onChange={(event) => setQuestionName(event.target.value)} />
            </Field>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:justify-end">
            <Button variant="outline" icon={<RotateCcw className="size-4" />} onClick={resetFilter}>
              重置
            </Button>
          </div>
        </CardContent>
      </Card>
      <ListView />
      <QuestionFormModal />
      <DetailView />
    </PageShell>
  );
}

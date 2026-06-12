import { Button, Card, CardContent, Field, PageShell, Select, classNames } from '@/components/ui';
import { useConfigs } from '@/hooks';
import { PracticeType, PracticeTypeMap } from '@ai-education/shared-web';
import { GRADES } from '@ai-education/shared-web';
import { Plus, RotateCcw } from 'lucide-react';
import { useQuestionTypeModel } from '../models/page';
import AbilityPracticeList from './AbilityList';
import { QuestionTypeFormModal } from './Form';
import UnitPracticeList from './UnitList';

export default function MainView() {
  const { subjects } = useConfigs();
  const { type, setType, subject, grade, setSubject, setGrade, showForm } = useQuestionTypeModel();
  const gradeOptions = Object.keys(GRADES).map((key) => Number(key));
  const items = [
    {
      key: PracticeType.UNIT_PRACTICE,
      label: PracticeTypeMap[PracticeType.UNIT_PRACTICE],
    },
    {
      key: PracticeType.ABILITY_PRACTICE,
      label: PracticeTypeMap[PracticeType.ABILITY_PRACTICE],
    },
  ];
  const isAbilityType = type === PracticeType.ABILITY_PRACTICE;

  const resetFilter = () => {
    if (subjects[0]) {
      setSubject(subjects[0]);
    }
    if (gradeOptions[0]) {
      setGrade(gradeOptions[0]);
    }
  };

  return (
    <PageShell title="题型管理" description="维护单元练习与能力练习的题型、提示词和生成配置。">
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Field label="练习类型">
              <div className="inline-flex w-fit rounded-lg bg-muted p-1">
                {items.map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    className={classNames(type === item.key && 'bg-background text-foreground shadow-sm')}
                    onClick={() => setType(item.key)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </Field>
            {isAbilityType ? (
              <>
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
              </>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:justify-end">
            {isAbilityType ? (
              <Button variant="outline" icon={<RotateCcw className="size-4" />} onClick={resetFilter}>
                重置
              </Button>
            ) : null}
            <Button icon={<Plus className="size-4" />} onClick={() => showForm()}>
              新增题型
            </Button>
          </div>
        </CardContent>
      </Card>
      {type === PracticeType.UNIT_PRACTICE ? <UnitPracticeList /> : <AbilityPracticeList />}
      <QuestionTypeFormModal />
    </PageShell>
  );
}

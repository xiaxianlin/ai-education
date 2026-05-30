import { Button, PageShell, classNames } from '@/components/ui';
import { PracticeType, PracticeTypeMap } from '@ai-education/shared-web';
import { useQuestionTypeModel } from '../models/page';
import AbilityPracticeList from './AbilityList';
import { QuestionTypeFormModal } from './Form';
import UnitPracticeList from './UnitList';

export default function MainView() {
  const { type, setType } = useQuestionTypeModel();
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

  return (
    <PageShell title="题型管理" description="维护单元练习与能力练习的题型、提示词和生成配置。">
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
      {type === PracticeType.UNIT_PRACTICE ? <UnitPracticeList /> : <AbilityPracticeList />}
      <QuestionTypeFormModal />
    </PageShell>
  );
}

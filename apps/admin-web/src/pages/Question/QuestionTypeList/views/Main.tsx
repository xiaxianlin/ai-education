import { PracticeType, PracticeTypeMap } from '@ai-education/shared-web';
import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import { useQuestionTypeModel } from '../models/page';
import AbilityPracticeList from './AbilityList';
import { QuestionTypeFormModal } from './Form';
import UnitPracticeList from './UnitList';

export default function MainView() {
  const { type, setType } = useQuestionTypeModel();
  return (
    <PageContainer title="题型管理">
      <Tabs
        activeKey={type}
        onChange={(key) => setType(key as PracticeType)}
        items={[
          {
            key: PracticeType.UNIT_PRACTICE,
            label: PracticeTypeMap[PracticeType.UNIT_PRACTICE],
            children: <UnitPracticeList />,
          },
          {
            key: PracticeType.ABILITY_PRACTICE,
            label: PracticeTypeMap[PracticeType.ABILITY_PRACTICE],
            children: <AbilityPracticeList />,
          },
        ]}
      />
      <QuestionTypeFormModal />
    </PageContainer>
  );
}

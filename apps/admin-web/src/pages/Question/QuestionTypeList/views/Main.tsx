import { PageContainer } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import AbilityPracticeList from './AbilityPracticeList';
import UnitPracticeList from './UnitPracticeList';

export default function MainView() {
  return (
    <PageContainer title="题型管理">
      <Tabs
        items={[
          { key: 'unit', label: '单元练习', children: <UnitPracticeList /> },
          { key: 'ability', label: '能力练习', children: <AbilityPracticeList /> },
        ]}
      />
    </PageContainer>
  );
}

import { useConfigs } from '@/hooks';
import { INTERACTION_TYPE_LABELS, InteractionType, Stage, STAGE_LABELS } from '@ai-education/shared-web';
import { PageContainer } from '@ant-design/pro-components';
import { Flex, Select } from 'antd';
import { useQuestionTypeModel } from '../models/page';
import FormView from './Form';
import TableView from './Table';

const stageOptions = Object.entries(STAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const interactionOptions = Object.entries(INTERACTION_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export default function MainView() {
  const { subjects } = useConfigs();
  const { subject, setSubject, stage, setStage, interactionType, setInteractionType } = useQuestionTypeModel();

  return (
    <PageContainer
      title="题型管理"
      header={{ breadcrumb: {} }}
      extra={
        <Flex gap={12}>
          <Select
            allowClear
            placeholder="科目"
            style={{ width: 120 }}
            value={subject}
            onChange={setSubject}
            options={subjects?.map((s: string) => ({ value: s, label: s }))}
          />
          <Select
            allowClear
            placeholder="学段"
            style={{ width: 120 }}
            value={stage}
            onChange={(v) => setStage(v as Stage)}
            options={stageOptions}
          />
          <Select
            allowClear
            placeholder="交互类型"
            style={{ width: 150 }}
            value={interactionType}
            onChange={(v) => setInteractionType(v as InteractionType)}
            options={interactionOptions}
          />
        </Flex>
      }
    >
      <TableView />
      <FormView />
    </PageContainer>
  );
}

import { Card } from 'antd';
import {
  AbilityConfigForm,
  DifficultyConfigForm,
  FeedbackConfigForm,
  QuestionCountConfigForm,
} from '../components';

export function ConfigForm() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="题量配置">
        <QuestionCountConfigForm name="question_count_config" />
      </Card>
      <Card title="难度配置">
        <DifficultyConfigForm name="difficulty_config" />
      </Card>
      <Card title="能力配置">
        <AbilityConfigForm name="ability_config" />
      </Card>
      <Card title="反馈配置">
        <FeedbackConfigForm name="feedback_config" />
      </Card>
    </div>
  );
}


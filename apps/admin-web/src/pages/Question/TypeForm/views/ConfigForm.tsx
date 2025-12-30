import { Card } from 'antd';
import {
  AnswerConfigForm,
  CognitiveConfigForm,
  FeedbackConfigForm,
  InteractionConfigForm,
  ResourceConfigForm,
} from '../components';

export function ConfigForm() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card title="交互配置">
        <InteractionConfigForm />
      </Card>
      <Card title="资源配置">
        <ResourceConfigForm />
      </Card>
      <Card title="答案配置">
        <AnswerConfigForm />
      </Card>
      <Card title="反馈配置">
        <FeedbackConfigForm />
      </Card>
      <Card title="认知配置">
        <CognitiveConfigForm />
      </Card>
    </div>
  );
}


import { AbilityConfigInfo, DifficultyConfigInfo, FeedbackConfigInfo, QuestionCountConfigInfo } from '../components';

interface ConfigInfoProps {
  detail: any;
}

export function ConfigInfo({ detail }: ConfigInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <QuestionCountConfigInfo config={detail.question_count_config} />
      <DifficultyConfigInfo config={detail.difficulty_config} />
      <AbilityConfigInfo config={detail.ability_config} subject={detail.subject} />
      <FeedbackConfigInfo config={detail.feedback_config} />
    </div>
  );
}

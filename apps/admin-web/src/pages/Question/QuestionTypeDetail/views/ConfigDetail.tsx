import {
  AnswerConfigDetail,
  CognitiveConfigDetail,
  FeedbackConfigDetail,
  InteractionConfigDetail,
  ResourceConfigDetail,
} from '../components';

interface ConfigDetailProps {
  item: any;
}

export function ConfigDetail({ item }: ConfigDetailProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <InteractionConfigDetail
        interactionType={item?.interaction_type}
        interactionConfig={item?.interaction_config}
      />
      <ResourceConfigDetail resourceType={item?.resource_type} resourceConfig={item?.resource_config} />
      <AnswerConfigDetail answerType={item?.answer_type} answerConfig={item?.answer_config} />
      <FeedbackConfigDetail feedbackConfig={item?.feedback_config} />
      <CognitiveConfigDetail
        cognitiveLevels={item?.cognitive_levels}
        abilityDimensions={item?.ability_dimensions}
        subject={item?.subject}
      />
    </div>
  );
}


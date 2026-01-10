import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  INTERACTION_TYPE_LABELS,
} from '@ai-education/shared-web';
import { Card } from 'antd';
import { memo } from 'react';
import { useQuestionResources } from '../../pages/Question/QuestionDetail/hooks/useQuestionResources';
import {
  QuestionAnswer,
  QuestionExplanation,
  QuestionKnowledgePoints,
  QuestionOptions,
  QuestionStem,
  QuestionSubQuestions,
} from './components';

interface QuestionCardProps {
  question: Question;
}

/**
 * 获取难度对应的 Tailwind 背景色类名
 */
function getDifficultyBadgeClasses(difficulty: string): string {
  const color = DIFFICULTY_COLORS[difficulty as Difficulty] || 'default';
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    default: 'bg-gray-50 text-gray-600 border-gray-100',
  };
  return colorMap[color] || colorMap.default;
}

export const QuestionCard = memo(function QuestionCard({ question }: QuestionCardProps) {
  const { stemImageResources, stemAudioResources, getOptionResources } = useQuestionResources(question);
  const isComposite =
    (question.stem?.sub_questions?.length || 0) > 0 || (question.stem as any)?.subQuestions?.length > 0;

  const subQuestions = question.stem?.sub_questions || (question.stem as any)?.subQuestions || [];

  // 构建标签（使用 Tailwind 类名的 Badge 样式）
  const titleTags = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] px-2 py-0.5 rounded border bg-blue-50 text-blue-500 border-blue-100">
        {question.subject}
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded border bg-green-50 text-green-500 border-green-100">
        {question.grade}年级
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded border bg-purple-50 text-purple-500 border-purple-100">
        {INTERACTION_TYPE_LABELS[question.question_type_code as keyof typeof INTERACTION_TYPE_LABELS] ||
          question.question_type_code}
      </span>
      <span className={`text-[10px] px-2 py-0.5 rounded border ${getDifficultyBadgeClasses(question.difficulty)}`}>
        {DIFFICULTY_LABELS[question.difficulty as Difficulty]}
      </span>
      {isComposite && (
        <span className="text-[10px] px-2 py-0.5 rounded border bg-red-50 text-red-500 border-red-100">复合题</span>
      )}
    </div>
  );

  return (
    <Card size="small" title={titleTags} className="rounded-xl border-gray-100" bordered={true}>
      <div className="flex flex-col gap-3">
        <QuestionStem
          stem={question.stem}
          stemImageResources={stemImageResources}
          stemAudioResources={stemAudioResources}
          resources={question.resources}
        />

        <QuestionOptions options={question.options} getOptionResources={getOptionResources} />

        <QuestionAnswer answer={question.answer} />

        {isComposite && subQuestions.length > 0 && <QuestionSubQuestions subQuestions={subQuestions} />}

        <QuestionKnowledgePoints knowledgePoints={question.knowledge_points} />

        <QuestionExplanation explanation={question.explanation} />
      </div>
    </Card>
  );
});

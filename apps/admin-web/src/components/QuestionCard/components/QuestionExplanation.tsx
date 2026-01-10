import { memo } from 'react';

interface QuestionExplanationProps {
  explanation: Question['explanation'];
}

export const QuestionExplanation = memo(function QuestionExplanation({ explanation }: QuestionExplanationProps) {
  if (!explanation) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-gray-400">解析</div>
      <div className="rounded-lg p-2.5 bg-amber-50/30 border border-amber-100">
        <div className="text-xs text-amber-700 leading-relaxed">{explanation}</div>
      </div>
    </div>
  );
});

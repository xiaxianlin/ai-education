import { memo } from 'react';

interface QuestionAnswerProps {
  answer: Question['answer'];
}

export const QuestionAnswer = memo(function QuestionAnswer({ answer }: QuestionAnswerProps) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-gray-400">答案</div>
      <div className="rounded-lg p-2.5 bg-green-50/30 border border-green-100">
        <div className="flex items-center gap-1.5 mb-1 text-green-600">
          <span className="text-sm font-medium">正确答案</span>
        </div>
        <div className="text-sm text-green-700 font-medium">
          {answer?.correct_answers?.join(', ') || '-'}
        </div>
      </div>
    </div>
  );
});

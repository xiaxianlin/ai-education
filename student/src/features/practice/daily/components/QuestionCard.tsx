import { memo } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import type { Question } from '@/services/practice';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export const QuestionCard = memo(function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <Card className="border-2 border-purple-200 shadow-lg">
      <CardContent className="pt-6 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
              {question.type}
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
              {question.difficulty}
            </span>
          </div>
          {question.knowledge && (
            <span className="text-sm text-gray-500">{question.knowledge}</span>
          )}
        </div>

        <div>
          <CardTitle className="text-lg mb-4">第 {index + 1} 题</CardTitle>
          <CardDescription className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
            {question.content}
          </CardDescription>
        </div>

        {question.resource && question.resource_type === 'image' && (
          <div className="flex justify-center">
            <img
              src={question.resource}
              alt="题目图片"
              className="max-w-full max-h-96 rounded-lg shadow-md"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});


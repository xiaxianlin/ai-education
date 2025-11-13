import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getResourceUrl } from '@/lib/utils/resource';
import AudioPlayer from '@/components/ui/AudioPlayer';
import type { Question } from '@/services/practice';

interface AssessmentQuestionCardProps {
  question: Question;
  userAnswer: string;
  showResult: boolean;
  submitting: boolean;
  onAnswer: (answer: string) => void;
}

export function AssessmentQuestionCard({
  question,
  userAnswer,
  showResult,
  submitting,
  onAnswer,
}: AssessmentQuestionCardProps) {
  const options: Array<string | { label: string; text: string }> = question.options
    ? JSON.parse(question.options)
    : [];

  return (
    <Card className="border-2 border-blue-100 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* 题目类型和难度 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
              {question.type === 'single' ? '单选题' : question.type}
            </span>
            {question.knowledge && (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                {question.knowledge}
              </span>
            )}
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
              难度: {question.difficulty}
            </span>
          </div>

          {/* 题干 */}
          <div className="text-xl font-medium leading-relaxed text-gray-800">
            {question.content}
          </div>

          {/* 题目资源 */}
          {question.resource_type === 'image' && question.resource && (
            <div className="my-4 flex justify-start">
              <img
                src={getResourceUrl(question.resource) || ''}
                alt="Question Resource"
                className="w-[120px] h-[120px] object-cover rounded-lg shadow-md"
              />
            </div>
          )}
          {question.resource_type === 'audio' && question.resource && (
            <div className="my-4">
              <AudioPlayer src={getResourceUrl(question.resource) || ''} />
            </div>
          )}

          {/* 选项 */}
          {options.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {options.map((option, index: number) => {
                const optionText =
                  typeof option === 'object' && option !== null && 'text' in option
                    ? option.text
                    : String(option);
                const isSelected = userAnswer === optionText;
                const isCorrect = showResult && optionText === question.answer;
                const isWrong = showResult && isSelected && userAnswer !== question.answer;

                return (
                  <button
                    key={index}
                    onClick={() => !showResult && !submitting && onAnswer(optionText)}
                    disabled={showResult || submitting}
                    className={cn(
                      'flex-1 min-w-[160px] flex items-center justify-center gap-4 p-6 rounded-2xl border-3 transition-all duration-300 shadow-lg hover:shadow-xl',
                      isSelected && !showResult && 'border-blue-400 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 scale-105 shadow-blue-200/50',
                      isCorrect && 'border-green-400 bg-gradient-to-br from-green-100 via-emerald-50 to-green-50 scale-105 shadow-green-200/50',
                      isWrong && 'border-red-400 bg-gradient-to-br from-red-100 via-rose-50 to-red-50 scale-105 shadow-red-200/50',
                      !showResult && !isSelected && 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50/30 hover:shadow-blue-100 cursor-pointer',
                      (showResult || submitting) && 'cursor-not-allowed',
                      showResult && !isSelected && 'opacity-60'
                    )}
                  >
                    <span className="text-xl text-gray-800 font-bold text-center leading-relaxed flex-1">
                      {optionText}
                    </span>
                    {isCorrect && <CheckCircle className="h-7 w-7 text-green-600 flex-shrink-0" />}
                    {isWrong && <XCircle className="h-7 w-7 text-red-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* 提交状态 */}
          {submitting && (
            <div className="flex items-center justify-center gap-3 p-4 text-blue-600">
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-lg font-medium">提交中...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


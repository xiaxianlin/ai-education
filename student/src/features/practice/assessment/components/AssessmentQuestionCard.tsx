import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
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
            <div className="my-4 flex justify-center">
              <img
                src={question.resource}
                alt="Question Resource"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
          {question.resource_type === 'audio' && question.resource && (
            <div className="my-4">
              <AudioPlayer src={question.resource} />
            </div>
          )}

          {/* 选项 */}
          {options.length > 0 && (
            <div className="space-y-4">
              {options.map((option, index: number) => {
                const optionText =
                  typeof option === 'object' && option !== null && 'text' in option
                    ? option.text
                    : String(option);
                const isSelected = userAnswer === optionText;
                const isCorrect = showResult && optionText === question.answer;
                const isWrong = showResult && isSelected && userAnswer !== question.answer;
                const optionLabel = String.fromCharCode(65 + index);

                return (
                  <button
                    key={index}
                    onClick={() => !showResult && !submitting && onAnswer(optionText)}
                    disabled={showResult || submitting}
                    className={cn(
                      'w-full p-6 text-left rounded-2xl border-3 transition-all duration-300 flex items-start gap-4 shadow-md hover:shadow-lg',
                      isSelected && !showResult && 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 scale-105',
                      isCorrect && 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 scale-105',
                      isWrong && 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 scale-105',
                      !showResult && !isSelected && 'border-gray-300 hover:border-blue-300 cursor-pointer hover:bg-blue-50/30',
                      (showResult || submitting) && 'cursor-not-allowed opacity-80'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md',
                        isSelected && !showResult && 'bg-blue-500 text-white',
                        isCorrect && 'bg-green-500 text-white',
                        isWrong && 'bg-red-500 text-white',
                        !isSelected && !isCorrect && !isWrong && 'bg-gray-200 text-gray-600'
                      )}
                    >
                      {optionLabel}
                    </div>
                    <span className="flex-1 pt-2 text-lg text-gray-800 font-medium">{optionText}</span>
                    {isCorrect && <CheckCircle className="h-8 w-8 text-green-600 mt-2" />}
                    {isWrong && <XCircle className="h-8 w-8 text-red-600 mt-2" />}
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


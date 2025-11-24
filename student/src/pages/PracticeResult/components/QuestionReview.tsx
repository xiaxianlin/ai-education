/**
 * 题目回顾组件
 */
import { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/types/schema';

interface QuestionReviewProps {
  questions: Question[];
  answers: Array<{
    question_id: number;
    question_content?: string;
    text_answer?: string;
    is_correct: number; // 0-未答, 1-正确, 2-错误
    time_spent: number;
  }>;
}

export const QuestionReview = memo(function QuestionReview({
  questions,
  answers,
}: QuestionReviewProps) {
  // 构建题目和答案的映射
  const questionAnswerMap = useMemo(() => {
    const map = new Map<number, typeof answers[0]>();
    answers.forEach(answer => {
      map.set(answer.question_id, answer);
    });
    return map;
  }, [answers]);

  // 分离正确和错误的题目
  const { correctQuestions, wrongQuestions } = useMemo(() => {
    const correct: typeof questions = [];
    const wrong: typeof questions = [];
    
    questions.forEach(question => {
      const answer = questionAnswerMap.get(question.id);
      if (answer) {
        if (answer.is_correct === 1) {
          correct.push(question);
        } else if (answer.is_correct === 2) {
          wrong.push(question);
        }
      }
    });
    
    return { correctQuestions: correct, wrongQuestions: wrong };
  }, [questions, questionAnswerMap]);

  if (wrongQuestions.length === 0 && correctQuestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 错题回顾 */}
      {wrongQuestions.length > 0 && (
        <Card className="border-2 border-red-200 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-800">错题回顾 ({wrongQuestions.length})</h2>
            </div>
            <div className="space-y-4">
              {wrongQuestions.map((question, index) => {
                const answer = questionAnswerMap.get(question.id);
                return (
                  <div
                    key={question.id}
                    className="p-4 rounded-xl bg-red-50 border-2 border-red-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-sm font-medium">
                            第 {index + 1} 题
                          </span>
                          {question.type && (
                            <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-sm">
                              {question.type}
                            </span>
                          )}
                        </div>
                        <p className="text-base text-gray-800 font-medium mb-2">
                          {question.content}
                        </p>
                        {answer?.text_answer && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">你的答案：</p>
                            <p className="text-sm font-medium text-red-700">{answer.text_answer}</p>
                          </div>
                        )}
                      </div>
                      {answer && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{answer.time_spent}秒</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 正确题目统计 */}
      {correctQuestions.length > 0 && (
        <Card className="border-2 border-green-200 shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">答对题目 ({correctQuestions.length})</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {correctQuestions.map((question, index) => {
                const answer = questionAnswerMap.get(question.id);
                return (
                  <div
                    key={question.id}
                    className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      第 {index + 1} 题
                    </span>
                    {answer && (
                      <span className="text-xs text-gray-500">{answer.time_spent}秒</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});


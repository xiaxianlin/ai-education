import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToHomeButton } from '@/components/BackToHomeButton';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { profileApi } from '@/services/profile';
import { toast } from 'sonner';

interface Question {
  id: number;
  type: string;
  subject: string;
  stem: string;
  options: string[];
  answer: string;
  textbook_id?: number;
  unit_id?: number;
  knowledge_id?: number;
}

export function DailyPractice() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 模拟题目数据
  const questions: Question[] = [
    {
      id: 1,
      type: 'single',
      subject: '数学',
      stem: '计算：15 + 27 = ?',
      options: ['42', '43', '44', '45'],
      answer: '42',
      textbook_id: 1,
    },
    {
      id: 2,
      type: 'single',
      subject: '数学',
      stem: '下列哪个分数最大？',
      options: ['1/3', '1/4', '1/2', '1/5'],
      answer: '1/2',
      textbook_id: 1,
    },
    {
      id: 3,
      type: 'single',
      subject: '英语',
      stem: 'I ___ to school every day.',
      options: ['go', 'goes', 'went', 'going'],
      answer: 'go',
      textbook_id: 2,
    },
  ];

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  const handleAnswer = async (answer: string) => {
    if (showResult) return;

    setAnswers({ ...answers, [currentIndex]: answer });
    setShowResult(true);

    // 自动提交学习记录
    try {
      const isCorrect = answer === currentQuestion.answer;
      await profileApi.createRecord({
        textbook_id: currentQuestion.textbook_id || 1,
        question_id: currentQuestion.id,
        is_correct: isCorrect ? 1 : 0,
        score: isCorrect ? 100 : 0,
        time_spent: 30, // 默认30秒
      });
    } catch (error) {
      console.error('Failed to create study record:', error);
    }
  };

  const handleNext = async () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
    } else {
      // 完成所有题目，跳转到完成页
      setSubmitting(true);
      toast.success('练习完成！');
      navigate({ to: '/daily-practice/result' });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowResult(false);
    }
  };

  const isCorrect = answers[currentIndex] === currentQuestion.answer;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 返回首页按钮 */}
        <div className="flex justify-end">
          <BackToHomeButton />
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              第 {currentIndex + 1} / {totalQuestions} 题
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 题目卡片 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* 科目标签 */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs px-3 py-1 rounded-full',
                    currentQuestion.subject === '数学'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  )}
                >
                  {currentQuestion.subject}
                </span>
              </div>

              {/* 题干 */}
              <div className="text-xl font-medium leading-relaxed">
                {currentQuestion.stem}
              </div>

              {/* 选项 */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentIndex] === option;
                  const isAnswerCorrect = showResult && option === currentQuestion.answer;
                  const isAnswerWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={showResult || submitting}
                      className={cn(
                        'w-full p-4 text-left rounded-lg border-2 transition-all',
                        isSelected && !showResult && 'border-primary bg-primary/5',
                        isAnswerCorrect && 'border-green-500 bg-green-50',
                        isAnswerWrong && 'border-red-500 bg-red-50',
                        !showResult && 'hover:border-primary/50 cursor-pointer',
                        showResult && 'cursor-not-allowed',
                        submitting && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{option}</span>
                        {isAnswerCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {isAnswerWrong && <XCircle className="h-5 w-5 text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 结果反馈 */}
              {showResult && (
                <div
                  className={cn(
                    'p-4 rounded-lg',
                    isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  )}
                >
                  <p className="font-medium">
                    {isCorrect
                      ? '✓ 回答正确！已记录学习记录'
                      : `✗ 回答错误，正确答案是：${currentQuestion.answer}，已加入错题本`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0 || submitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            上一题
          </Button>

          <Button
            onClick={handleNext}
            disabled={(!showResult && !answers[currentIndex]) || submitting}
          >
            {submitting
              ? '提交中...'
              : currentIndex === totalQuestions - 1
              ? '完成练习'
              : '下一题'}
            {!submitting && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

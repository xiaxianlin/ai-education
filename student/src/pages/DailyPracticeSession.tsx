import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Send,
  Trophy,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  practiceApi,
  DailyPracticeSessionDetail,
  Question,
  DailyPracticeReport,
} from '@/services/practice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DailyPracticeSession() {
  const { sessionId } = useParams({ from: '/daily-practice/$sessionId' });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<DailyPracticeSessionDetail | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [answerResults, setAnswerResults] = useState<Record<number, boolean>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showResult, setShowResult] = useState(false);
  const [practiceReport, setPracticeReport] = useState<DailyPracticeReport | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const data = await practiceApi.getDailyPracticeSession(parseInt(sessionId!));
      setSessionData(data);
      setStartTime(Date.now());
    } catch (error: any) {
      console.error('Failed to load session:', error);
      toast.error(error.message || '加载练习失败');
      navigate('/daily-practice');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = sessionData?.questions[currentQuestionIndex];
  const totalQuestions = sessionData?.questions.length || 0;
  const answeredCount = Object.keys(userAnswers).length;

  const handleAnswerChange = (answer: string) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !sessionData) return;

    const answer = userAnswers[currentQuestion.id];
    if (!answer) {
      toast.error('请先选择答案');
      return;
    }

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const result = await practiceApi.submitDailyAnswer({
        session_id: sessionData.session.id,
        question_id: currentQuestion.id,
        answer,
        time_spent: timeSpent,
      });

      setAnswerResults((prev) => ({
        ...prev,
        [currentQuestion.id]: result.is_correct,
      }));

      toast.success(result.is_correct ? '回答正确！' : '回答错误');

      // 自动进入下一题
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setStartTime(Date.now());
        }
      }, 1500);
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      toast.error(error.message || '提交答案失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompletePractice = async () => {
    if (!sessionData) return;

    const unansweredCount = totalQuestions - answeredCount;
    if (unansweredCount > 0) {
      const confirm = window.confirm(`还有 ${unansweredCount} 道题未回答，确定要结束练习吗？`);
      if (!confirm) return;
    }

    try {
      setSubmitting(true);
      const report = await practiceApi.completeDailyPractice(sessionData.session.id);
      setPracticeReport(report);
      setShowResult(true);
    } catch (error: any) {
      console.error('Failed to complete practice:', error);
      toast.error(error.message || '完成练习失败');
    } finally {
      setSubmitting(false);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setStartTime(Date.now());
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setStartTime(Date.now());
    }
  };

  const renderQuestionContent = (question: Question) => {
    const answer = userAnswers[question.id];
    const hasAnswered = answerResults[question.id] !== undefined;

    let options: string[] = [];
    try {
      options = question.options ? JSON.parse(question.options) : [];
    } catch {
      options = question.options ? question.options.split('\n') : [];
    }

    if (question.type === '选择题') {
      return (
        <div className="space-y-4">
          {options.map((option, index) => {
            const optionLabel = String.fromCharCode(65 + index);
            const isSelected = answer === optionLabel;

            return (
              <button
                key={index}
                onClick={() => !hasAnswered && handleAnswerChange(optionLabel)}
                disabled={hasAnswered}
                className={cn(
                  'w-full text-left p-6 rounded-2xl border-3 transition-all duration-300 shadow-md hover:shadow-lg',
                  isSelected
                    ? hasAnswered
                      ? answerResults[question.id]
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 scale-105'
                        : 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 scale-105'
                      : 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 scale-105'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30',
                  hasAnswered && 'cursor-not-allowed opacity-80'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-md',
                      isSelected
                        ? hasAnswered
                          ? answerResults[question.id]
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {optionLabel}
                  </div>
                  <div className="flex-1 pt-2 text-lg text-gray-800 font-medium">{option}</div>
                  {isSelected && hasAnswered && (
                    <div className="flex-shrink-0 mt-2">
                      {answerResults[question.id] ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      );
    } else if (question.type === '判断题') {
      return (
        <div className="space-y-4">
          {[
            { value: '正确', emoji: '✅' },
            { value: '错误', emoji: '❌' },
          ].map(({ value: option, emoji }) => {
            const isSelected = answer === option;
            return (
              <button
                key={option}
                onClick={() => !hasAnswered && handleAnswerChange(option)}
                disabled={hasAnswered}
                className={cn(
                  'w-full p-6 rounded-2xl border-3 transition-all duration-300 shadow-md hover:shadow-lg',
                  isSelected
                    ? hasAnswered
                      ? answerResults[question.id]
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 scale-105'
                        : 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 scale-105'
                      : 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 scale-105'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30',
                  hasAnswered && 'cursor-not-allowed opacity-80'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="text-4xl">{emoji}</span>
                    {option}
                  </span>
                  {isSelected && hasAnswered && (
                    <div className="flex-shrink-0">
                      {answerResults[question.id] ? (
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      );
    } else {
      return (
        <div>
          <textarea
            value={answer || ''}
            onChange={(e) => !hasAnswered && handleAnswerChange(e.target.value)}
            disabled={hasAnswered}
            placeholder="请输入你的答案..."
            className={cn(
              'w-full p-6 border-3 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all text-lg',
              hasAnswered
                ? answerResults[question.id]
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-blue-400',
              hasAnswered && 'cursor-not-allowed'
            )}
            rows={6}
          />
          {hasAnswered && (
            <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-gray-50">
              {answerResults[question.id] ? (
                <CheckCircle className="h-7 w-7 text-green-600" />
              ) : (
                <XCircle className="h-7 w-7 text-red-600" />
              )}
              <span
                className={cn(
                  'text-lg font-bold',
                  answerResults[question.id] ? 'text-green-700' : 'text-red-700'
                )}
              >
                {answerResults[question.id] ? '回答正确！✨' : '回答错误'}
              </span>
            </div>
          )}
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-400 mx-auto"></div>
              <p className="mt-6 text-lg font-medium text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResult && practiceReport) {
    const distribution = practiceReport.question_distribution;
    const formatDate = (dateNum: number) => {
      const str = String(dateNum);
      return `${str.slice(0, 4)}年${str.slice(4, 6)}月${str.slice(6, 8)}日`;
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* 完成标题 */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">今日练习完成！</h1>
            <p className="text-gray-600">{formatDate(practiceReport.date)}</p>
          </div>

          {/* 成绩卡片 */}
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{practiceReport.score.toFixed(0)}</div>
                  <div className="text-sm text-gray-600 mt-1">得分</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {practiceReport.correct_questions}/{practiceReport.total_questions}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">正确题数</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {((practiceReport.correct_questions / practiceReport.total_questions) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">正确率</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.floor(practiceReport.total_time / 60)}:{(practiceReport.total_time % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">用时</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 题目分布 */}
          <Card className="border-2 border-purple-200 shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-purple-500" />
                题目分布
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-2xl font-bold text-red-600">{distribution.wrong || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">错题复习</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{distribution.consolidate || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">巩固练习</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{distribution.challenge || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">挑战题目</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{distribution.new || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">新知识点</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 知识点掌握情况 */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                知识点掌握情况
              </h2>
              <div className="space-y-3">
                {Object.entries(practiceReport.knowledge_coverage).map(([knowledge, score]) => (
                  <div key={knowledge} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">{knowledge}</span>
                      <span className="text-gray-600">
                        {score.correct}/{score.total} ({(score.rate * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500 rounded-full',
                          score.rate >= 0.8
                            ? 'bg-green-500'
                            : score.rate >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${score.rate * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/home')} className="flex-1">
              返回首页
            </Button>
            <Button onClick={() => navigate('/practice-history')} className="flex-1">
              查看练习历史
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData || !currentQuestion) {
    return null;
  }

  const hasAnswered = answerResults[currentQuestion.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 进度条 */}
        <Card className="border-2 border-blue-200 shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-gray-800">今日练习</span>
              </div>
              <span className="text-sm text-gray-600">
                {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
              <span>已答：{answeredCount} 题</span>
              <span>剩余：{totalQuestions - currentQuestionIndex - 1} 题</span>
            </div>
          </CardContent>
        </Card>

        {/* 题目卡片 */}
        <Card className="border-2 border-purple-200 shadow-lg">
          <CardContent className="pt-6 pb-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                  {currentQuestion.type}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-medium">
                  {currentQuestion.difficulty}
                </span>
              </div>
              {currentQuestion.knowledge && (
                <span className="text-sm text-gray-500">{currentQuestion.knowledge}</span>
              )}
            </div>

            <div>
              <CardTitle className="text-lg mb-4">第 {currentQuestionIndex + 1} 题</CardTitle>
              <CardDescription className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.content}
              </CardDescription>
            </div>

            {currentQuestion.resource && currentQuestion.resource_type === 'image' && (
              <div className="flex justify-center">
                <img
                  src={currentQuestion.resource}
                  alt="题目图片"
                  className="max-w-full max-h-96 rounded-lg shadow-md"
                />
              </div>
            )}

            <div>{renderQuestionContent(currentQuestion)}</div>

            <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 h-16 text-lg font-bold rounded-2xl border-2"
              >
                <ChevronLeft className="h-6 w-6 mr-2" />
                上一题
              </Button>
              {!hasAnswered ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswers[currentQuestion.id] || submitting}
                  className="flex-1 h-16 text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl shadow-lg"
                >
                  <Send className="h-6 w-6 mr-2" />
                  {submitting ? '提交中...' : '提交答案 ✓'}
                </Button>
              ) : currentQuestionIndex < totalQuestions - 1 ? (
                <Button 
                  onClick={goToNextQuestion} 
                  className="flex-1 h-16 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl shadow-lg"
                >
                  下一题
                  <ChevronRight className="h-6 w-6 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompletePractice}
                  disabled={submitting}
                  className="flex-1 h-16 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl shadow-lg"
                >
                  <Trophy className="h-6 w-6 mr-2" />
                  {submitting ? '完成中...' : '完成练习 🎉'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


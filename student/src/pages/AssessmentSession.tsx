import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  Loader2,
  Award,
  Lightbulb,
  BarChart,
  Brain,
  Target,
  Zap,
  TrendingUp,
} from 'lucide-react';
import {
  practiceApi,
  AssessmentNextQuestion,
  AssessmentReport,
} from '@/services/practice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import AudioPlayer from '@/components/ui/AudioPlayer';

export function AssessmentSession() {
  const { assessmentId } = useParams({ from: '/assessment/$assessmentId' });
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [nextQuestionData, setNextQuestionData] = useState<AssessmentNextQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [timeStarted, setTimeStarted] = useState(Date.now());

  useEffect(() => {
    loadNextQuestion();
  }, [assessmentId]);

  const loadNextQuestion = async () => {
    try {
      setLoading(true);
      setUserAnswer('');
      setShowResult(false);
      setTimeStarted(Date.now());
      
      const data = await practiceApi.getNextAssessmentQuestion(Number(assessmentId));
      
      if (!data) {
        // 没有下一题，评测结束
        await completeAssessment();
      } else {
        setNextQuestionData(data);
      }
    } catch (error: any) {
      console.error('Failed to load next question:', error);
      toast.error(error.message || '加载题目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (showResult || submitting) return;

    setUserAnswer(answer);
    setSubmitting(true);
    const timeSpent = Math.round((Date.now() - timeStarted) / 1000);

    try {
      const result = await practiceApi.submitAssessmentAnswer({
        assessment_id: Number(assessmentId),
        question_id: nextQuestionData!.question.id,
        answer,
        time_spent: timeSpent,
      });

      setShowResult(true);
      toast.success(result.is_correct ? '回答正确！' : '回答错误。');

      // 自动加载下一题（延迟2秒让学生看结果）
      setTimeout(async () => {
        await loadNextQuestion();
      }, 2000);
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      toast.error(error.message || '提交答案失败');
      setSubmitting(false);
    }
  };

  const completeAssessment = async () => {
    try {
      setSubmitting(true);
      const fetchedReport = await practiceApi.completeAssessment(Number(assessmentId));
      setReport(fetchedReport);
      toast.success('能力评测完成！');
    } catch (error: any) {
      console.error('Failed to complete assessment:', error);
      toast.error(error.message || '完成评测失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !nextQuestionData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-400 mx-auto"></div>
              <p className="mt-6 text-lg font-medium text-gray-600">加载评测中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 显示报告
  if (report) {
    const abilityLevelMap: Record<string, { label: string; color: string }> = {
      beginner: { label: '初学者', color: 'text-blue-600' },
      intermediate: { label: '熟练', color: 'text-green-600' },
      advanced: { label: '精通', color: 'text-purple-600' },
    };

    const levelInfo = abilityLevelMap[report.ability_level] || { label: report.ability_level, color: 'text-gray-600' };

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          <Card className="border-2 border-blue-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center">
              <Award className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">能力评测报告</h1>
              <p className="text-gray-600 text-lg">评测已完成</p>
            </div>

            <CardContent className="pt-6 pb-8 space-y-6">
              {/* 总体成绩 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-600">综合得分</p>
                  <p className="text-3xl font-bold text-blue-700">{report.overall_score.toFixed(1)}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-600">能力等级</p>
                  <p className={cn('text-2xl font-bold', levelInfo.color)}>{levelInfo.label}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-gray-600">答题数</p>
                  <p className="text-3xl font-bold text-green-700">{report.answered_count}</p>
                </div>
              </div>

              {/* 能力分解 */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart className="h-6 w-6 text-blue-500" />
                  各难度表现
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(report.report.ability_breakdown).map(([difficulty, stats]) => {
                    const difficultyMap: Record<string, { label: string; color: string }> = {
                      简单: { label: '简单', color: 'bg-green-500' },
                      普通: { label: '普通', color: 'bg-yellow-500' },
                      困难: { label: '困难', color: 'bg-red-500' },
                    };
                    const info = difficultyMap[difficulty] || { label: difficulty, color: 'bg-gray-500' };
                    const rate = stats.count > 0 ? (stats.correct / stats.count) * 100 : 0;

                    return (
                      <Card key={difficulty} className="p-4">
                        <CardTitle className="text-sm font-semibold text-gray-700 mb-2">
                          {info.label}
                        </CardTitle>
                        <p className="text-xs text-gray-600 mb-2">
                          {stats.correct}/{stats.count} 正确
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn('h-2 rounded-full', info.color)}
                            style={{ width: `${rate}%` }}
                          ></div>
                        </div>
                        <p className="text-right text-xs text-gray-600 mt-1">{rate.toFixed(0)}%</p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* 知识点掌握 */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-purple-500" />
                  知识点掌握情况
                </h3>
                <div className="space-y-3">
                  {Object.entries(report.report.knowledge_mastery).map(([knowledge, stats]) => {
                    const rate = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                    let colorClass = 'bg-gray-400';
                    if (rate >= 80) colorClass = 'bg-green-500';
                    else if (rate >= 60) colorClass = 'bg-yellow-500';
                    else if (rate >= 40) colorClass = 'bg-orange-500';
                    else colorClass = 'bg-red-500';

                    return (
                      <Card key={knowledge} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-base font-semibold text-gray-800">
                            {knowledge}
                          </CardTitle>
                          <span className="text-sm text-gray-600">
                            {stats.correct}/{stats.total} 题
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={cn('h-2.5 rounded-full', colorClass)} style={{ width: `${rate}%` }}></div>
                        </div>
                        <p className="text-right text-xs text-gray-600 mt-1">掌握度: {rate.toFixed(0)}%</p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* 学习指标 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="flex items-center gap-3">
                    <Zap className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">学习速度</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {(report.report.learning_speed * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">答题稳定性</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {(report.report.consistency * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* 优势与薄弱点 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.report.strengths.length > 0 && (
                  <Card className="p-4 bg-green-50">
                    <CardTitle className="text-base font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      优势
                    </CardTitle>
                    <ul className="space-y-1">
                      {report.report.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-green-700">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
                {report.report.weaknesses.length > 0 && (
                  <Card className="p-4 bg-red-50">
                    <CardTitle className="text-base font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      需要提升
                    </CardTitle>
                    <ul className="space-y-1">
                      {report.report.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-red-700">
                          • {weakness}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {/* 学习建议 */}
              {report.report.recommendations.length > 0 && (
                <Card className="p-4 bg-blue-50">
                  <CardTitle className="text-base font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    学习建议
                  </CardTitle>
                  <ul className="space-y-2">
                    {report.report.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="text-blue-500 font-bold">{index + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* 返回按钮 */}
              <div className="flex justify-center mt-8">
                <Button onClick={() => navigate({ to: '/assessment' })} className="w-full max-w-xs">
                  返回能力评测
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!nextQuestionData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">评测会话不存在</h2>
          <Button onClick={() => navigate({ to: '/assessment' })} className="mt-4">
            返回能力评测
          </Button>
        </div>
      </div>
    );
  }

  const question = nextQuestionData.question;
  const progress = nextQuestionData.progress;
  const options = question.options ? JSON.parse(question.options) : [];
  const isAnswered = userAnswer !== '';

  // 能力值可视化
  const abilityPercentage = ((nextQuestionData.current_ability + 3) / 6) * 100;
  const confidencePercentage = nextQuestionData.confidence * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 头部信息 */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate({ to: '/assessment' })}
            className="flex items-center gap-1 text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span className="text-lg font-semibold text-gray-700">能力评测</span>
          </div>
        </div>

        {/* 进度和能力指标 */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                第 {progress.current} 题 ({progress.min}-{progress.max} 题)
              </span>
              <span className="text-gray-600">
                {((progress.current / progress.max) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
                style={{ width: `${(progress.current / progress.max) * 100}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">能力值</span>
                  <span className="text-gray-600">{nextQuestionData.current_ability.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${abilityPercentage}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">置信度</span>
                  <span className="text-gray-600">{confidencePercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${confidencePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 题目卡片 */}
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

              {/* 选项 - 更大更明显 */}
              {options.length > 0 && (
                <div className="space-y-4">
                  {options.map((option: string, index: number) => {
                    const isSelected = userAnswer === option;
                    const isCorrect = showResult && option === question.answer;
                    const isWrong = showResult && isSelected && userAnswer !== question.answer;
                    const optionLabel = String.fromCharCode(65 + index); // A, B, C, D

                    return (
                      <button
                        key={index}
                        onClick={() => !showResult && !submitting && handleAnswer(option)}
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
                        <span className="flex-1 pt-2 text-lg text-gray-800 font-medium">{option}</span>
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
      </div>
    </div>
  );
}


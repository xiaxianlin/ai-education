import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Award,
  Lightbulb,
  BarChart,
  Target,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssessmentReport as AssessmentReportType } from '@/services/practice';

interface AssessmentReportProps {
  report: AssessmentReportType;
}

export function AssessmentReport({ report }: AssessmentReportProps) {
  const navigate = useNavigate();

  const abilityLevelMap: Record<string, { label: string; color: string }> = {
    beginner: { label: '初学者', color: 'text-blue-600' },
    intermediate: { label: '熟练', color: 'text-green-600' },
    advanced: { label: '精通', color: 'text-purple-600' },
  };

  const levelInfo = abilityLevelMap[report.ability_level] || {
    label: report.ability_level,
    color: 'text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
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
                        />
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
                        <div
                          className={cn('h-2.5 rounded-full', colorClass)}
                          style={{ width: `${rate}%` }}
                        />
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


import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyPracticeReport } from '@/services/practice';

interface ResultModalProps {
  report: DailyPracticeReport;
}

export function ResultModal({ report }: ResultModalProps) {
  const navigate = useNavigate();

  const formatDate = (dateNum: number) => {
    const str = String(dateNum);
    return `${str.slice(0, 4)}年${str.slice(4, 6)}月${str.slice(6, 8)}日`;
  };

  const distribution = report.question_distribution;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 完成标题 */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">今日练习完成！</h1>
          <p className="text-gray-600">{formatDate(report.date)}</p>
        </div>

        {/* 成绩卡片 */}
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{report.score.toFixed(0)}</div>
                <div className="text-sm text-gray-600 mt-1">得分</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {report.correct_questions}/{report.total_questions}
                </div>
                <div className="text-sm text-gray-600 mt-1">正确题数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {((report.correct_questions / report.total_questions) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">正确率</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.floor(report.total_time / 60)}:
                  {(report.total_time % 60).toString().padStart(2, '0')}
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
              {Object.entries(report.knowledge_coverage).map(([knowledge, score]) => (
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
          <Button variant="outline" onClick={() => navigate({ to: '/home' })} className="flex-1">
            返回首页
          </Button>
          <Button onClick={() => navigate({ to: '/practice-history' })} className="flex-1">
            查看练习历史
          </Button>
        </div>
      </div>
    </div>
  );
}


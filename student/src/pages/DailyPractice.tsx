import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import {
  Calendar,
  Target,
  TrendingUp,
  Zap,
  Play,
  Sparkles,
  Award,
  BookCheck,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { practiceApi } from '@/services/practice';
import { toast } from 'sonner';

export function DailyPractice() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [selectedCount, setSelectedCount] = useState(10);

  const handleStartPractice = async () => {
    try {
      setCreating(true);
      const session = await practiceApi.createDailyPractice({ count: selectedCount });
      toast.success('今日练习已创建，开始答题！');
      navigate({ to: `/daily-practice/${session.id}` });
    } catch (error: any) {
      console.error('Failed to create daily practice:', error);
      toast.error(error.message || '创建练习失败');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 头部 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            今日练习
          </h1>
          <p className="text-gray-600 text-base">
            智能推荐，个性化学习 - 每天进步一点点
          </p>
        </div>

        {/* 主卡片 */}
        <Card className="border-2 border-blue-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Sparkles className="h-7 w-7 text-yellow-500" />
                  开始今日练习
                </h2>
                <p className="text-gray-600 text-sm">
                  基于你的学习情况，智能推荐最适合的题目
                </p>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-md">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="pt-6 pb-8 space-y-6">
            {/* 智能推荐算法说明 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="p-2 rounded-lg bg-red-100">
                  <BookCheck className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">错题复习</div>
                  <div className="text-xs text-gray-600 mt-1">30% - 巩固薄弱知识点</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">巩固练习</div>
                  <div className="text-xs text-gray-600 mt-1">40% - 强化已学内容</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-100">
                <div className="p-2 rounded-lg bg-orange-100">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">挑战题目</div>
                  <div className="text-xs text-gray-600 mt-1">20% - 提升解题能力</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                <div className="p-2 rounded-lg bg-green-100">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">新知识点</div>
                  <div className="text-xs text-gray-600 mt-1">10% - 拓展学习范围</div>
                </div>
              </div>
            </div>

            {/* 题目数量选择 */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">选择题目数量</label>
              <div className="grid grid-cols-4 gap-3">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={cn(
                      'px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all',
                      selectedCount === count
                        ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-md'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-blue-50/50'
                    )}
                  >
                    {count} 题
                  </button>
                ))}
              </div>
            </div>

            {/* 开始按钮 */}
            <Button
              onClick={handleStartPractice}
              disabled={creating}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                  创建中...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" fill="currentColor" />
                  开始今日练习
                </>
              )}
            </Button>

            {/* 提示 */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Award className="h-4 w-4" />
              <span>坚持每日练习，养成良好学习习惯</span>
            </div>
          </CardContent>
        </Card>

        {/* 功能特色 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-base">智能推荐</CardTitle>
              </div>
              <CardDescription className="text-sm">
                基于学习历史和错题情况，智能推荐最适合你的题目
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-base">精准定位</CardTitle>
              </div>
              <CardDescription className="text-sm">
                准确识别薄弱知识点，针对性强化训练
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-base">持续进步</CardTitle>
              </div>
              <CardDescription className="text-sm">
                实时跟踪学习效果，见证每一天的成长
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

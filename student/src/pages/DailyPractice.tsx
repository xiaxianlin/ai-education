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
      toast.success('🎉 太好了！开始答题吧！');
      navigate({ to: `/daily-practice/${session.id}` });
    } catch (error: any) {
      console.error('Failed to create daily practice:', error);
      toast.error(error.message || '哎呀，出错了，再试一次吧');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* 头部卡片 - 一行内展示 */}
        <Card className="border-2 border-blue-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl">📅</div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">今日练习</h1>
                <p className="text-base text-gray-600">每天10分钟，轻松学知识！✨</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主卡片 */}
        <Card className="border-2 border-blue-300 shadow-2xl overflow-hidden rounded-3xl">
          <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 p-8 text-center">
            <div className="text-7xl mb-4">🤖</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              智能推荐题目
            </h2>
            <p className="text-base text-gray-600">
              根据你的学习情况，为你选最合适的题目！
            </p>
          </div>

          <CardContent className="p-8 space-y-8">
            {/* 简化的题目组成说明 - 用表情符号 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 text-center">
                <div className="text-5xl mb-3">📕</div>
                <p className="text-lg font-bold text-gray-800">错题复习</p>
                <p className="text-sm text-gray-600 mt-1">巩固一下</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 text-center">
                <div className="text-5xl mb-3">📘</div>
                <p className="text-lg font-bold text-gray-800">巩固练习</p>
                <p className="text-sm text-gray-600 mt-1">多练练</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 text-center">
                <div className="text-5xl mb-3">🚀</div>
                <p className="text-lg font-bold text-gray-800">挑战题目</p>
                <p className="text-sm text-gray-600 mt-1">试试看</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 text-center">
                <div className="text-5xl mb-3">✨</div>
                <p className="text-lg font-bold text-gray-800">新知识</p>
                <p className="text-sm text-gray-600 mt-1">学新的</p>
              </div>
            </div>

            {/* 题目数量选择 - 更大更明显 */}
            <div className="space-y-4">
              <label className="text-xl font-bold text-gray-800 text-center block">选几道题？</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[5, 10, 15, 20].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSelectedCount(count)}
                    className={cn(
                      'h-24 rounded-2xl border-3 font-bold text-2xl transition-all duration-200',
                      selectedCount === count
                        ? 'border-blue-500 bg-gradient-to-br from-blue-400 to-purple-500 text-white shadow-xl scale-110'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50 shadow-md'
                    )}
                  >
                    <div>{count}</div>
                    <div className="text-sm font-normal">题</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 开始按钮 - 超大 */}
            <Button
              onClick={handleStartPractice}
              disabled={creating}
              className="w-full h-20 text-2xl font-bold rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-7 w-7 border-3 border-white border-t-transparent mr-3" />
                  准备中...
                </>
              ) : (
                <>
                  <span className="text-3xl mr-2">🚀</span>
                  开始答题
                </>
              )}
            </Button>

            {/* 鼓励提示 */}
            <div className="text-center py-4 px-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200">
              <p className="text-lg font-bold text-gray-800">
                坚持每天练习，你会越来越棒！⭐
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

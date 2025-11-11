import { useState, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { practiceApi, DailyPracticeSession } from '@/services/practice';
import { toast } from 'sonner';

export function DailyPractice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<DailyPracticeSession | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('checking');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    checkTodayPractice();
  }, []);

  const checkTodayPractice = async () => {
    try {
      setLoading(true);
      const result = await practiceApi.checkTodayPractice();
      
      if (result.session) {
        // 已有会话，可以直接开始
        setSession(result.session);
        setStatus('ready');
        setProgress(100);
      } else if (result.task_id) {
        // 正在生成
        setTaskId(result.task_id);
        setStatus(result.status);
        setProgress(result.progress);
        // 开始轮询进度
        pollProgress(result.task_id);
      } else {
        setStatus('error');
      }
    } catch (error: any) {
      console.error('Failed to check today practice:', error);
      toast.error(error.message || '检查今日练习失败');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const pollProgress = async (taskId: number) => {
    const interval = setInterval(async () => {
      try {
        const result = await practiceApi.getDailyPracticeProgress(taskId);
        setStatus(result.status);
        setProgress(result.progress);

        if (result.status === 'completed' && result.session) {
          // 生成完成
          clearInterval(interval);
          setSession(result.session);
          setStatus('ready');
          setProgress(100);
          toast.success('🎉 今日练习已生成！');
        } else if (result.status === 'failed') {
          // 生成失败
          clearInterval(interval);
          setStatus('error');
          toast.error(result.error_message || '生成今日练习失败');
        }
      } catch (error: any) {
        console.error('Failed to get progress:', error);
        clearInterval(interval);
        setStatus('error');
      }
    }, 2000); // 每2秒轮询一次

    // 30秒后停止轮询（防止无限轮询）
    setTimeout(() => {
      clearInterval(interval);
    }, 30000);
  };

  const handleStartPractice = async () => {
    if (!session) {
      toast.error('练习尚未生成完成');
      return;
    }

    try {
      navigate({ to: `/daily-practice/${session.id}` });
    } catch (error: any) {
      console.error('Failed to start practice:', error);
      toast.error(error.message || '启动练习失败');
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* 生成进度显示 */}
            {loading ? (
              <div className="space-y-4 text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
                <p className="text-lg text-gray-600">正在检查今日练习...</p>
              </div>
            ) : status === 'ready' && session ? (
              <div className="space-y-4">
                <div className="text-center py-4 px-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                  <p className="text-lg font-bold text-gray-800 mb-2">
                    ✅ 今日练习已准备就绪！
                  </p>
                  <p className="text-sm text-gray-600">
                    共 {session.total_questions} 道题目，随时可以开始
                  </p>
                </div>
                <Button
                  onClick={handleStartPractice}
                  className="w-full h-20 text-2xl font-bold rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <span className="text-3xl mr-2">🚀</span>
                  开始答题
                </Button>
              </div>
            ) : status === 'generating' || status === 'pending' || status === 'running' ? (
              <div className="space-y-4">
                <div className="text-center py-4 px-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-3" />
                  <p className="text-lg font-bold text-gray-800 mb-2">
                    正在生成今日练习...
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">{progress}%</p>
                </div>
                <Button
                  disabled
                  className="w-full h-20 text-2xl font-bold rounded-2xl bg-gray-300 text-gray-500 cursor-not-allowed"
                >
                  生成中，请稍候...
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4 px-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200">
                  <p className="text-lg font-bold text-gray-800 mb-2">
                    ⚠️ 生成失败
                  </p>
                  <p className="text-sm text-gray-600">
                    请刷新页面重试
                  </p>
                </div>
                <Button
                  onClick={checkTodayPractice}
                  className="w-full h-20 text-2xl font-bold rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
                >
                  重新检查
                </Button>
              </div>
            )}

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

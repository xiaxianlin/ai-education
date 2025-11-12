/**
 * 能力评测页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Play, Loader2 } from 'lucide-react';
import { useAssessment } from './hooks/useAssessment';

export function Assessment() {
  const { creating, handleStartAssessment } = useAssessment();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-blue-50/50 to-pink-50/50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 头部卡片 */}
        <Card className="border-2 border-purple-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl animate-bounce">🎯</div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">能力评估</h1>
                <p className="text-base text-gray-600">让AI帮你找到学习的方向！</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 信息卡 */}
        <Card className="border-2 border-purple-300 shadow-2xl overflow-hidden rounded-3xl">
          <CardContent className="p-8 space-y-6">
            {/* 特点展示 */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 text-center">
                <div className="text-5xl mb-3">🤖</div>
                <p className="text-lg font-bold text-gray-800 mb-1">智能选题</p>
                <p className="text-sm text-gray-600">根据你的表现选题</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 text-center">
                <div className="text-5xl mb-3">⏱️</div>
                <p className="text-lg font-bold text-gray-800 mb-1">10-20 题</p>
                <p className="text-sm text-gray-600">大约 15 分钟</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 text-center">
                <div className="text-5xl mb-3">📊</div>
                <p className="text-lg font-bold text-gray-800 mb-1">详细报告</p>
                <p className="text-sm text-gray-600">看看哪里学得好</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 text-center">
                <div className="text-5xl mb-3">💡</div>
                <p className="text-lg font-bold text-gray-800 mb-1">学习建议</p>
                <p className="text-sm text-gray-600">告诉你怎么学更好</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 开始按钮 */}
        <div className="space-y-4">
          <Button
            className="w-full h-20 text-2xl font-bold bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 rounded-3xl"
            onClick={handleStartAssessment}
            disabled={creating}
          >
            {creating ? (
              <>
                <Loader2 className="h-8 w-8 mr-3 animate-spin" />
                准备评估中...
              </>
            ) : (
              <>
                <Play className="h-8 w-8 mr-3" fill="currentColor" />
                开始评估 🚀
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


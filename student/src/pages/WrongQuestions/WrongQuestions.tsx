/**
 * 错题集页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/biz/LoadingSpinner';
import { useWrongQuestions } from './hooks/useWrongQuestions';
import { WrongQuestionCard } from './components/WrongQuestionCard';
import { FilterTabs } from './components/FilterTabs';

export function WrongQuestions() {
  const {
    wrongQuestions,
    loading,
    filter,
    loadingAction,
    stats,
    setFilter,
    handleMarkAsMastered,
    handleUnmarkAsMastered,
    reload,
  } = useWrongQuestions();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部卡片 */}
        <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden bg-white/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">❌</div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">我的错题</h1>
                  <p className="text-sm text-gray-500">巩固薄弱知识点</p>
                </div>
              </div>

              {/* 统计信息 */}
              <div className="flex items-center gap-3 text-sm">
                <div className="text-center px-3 py-1.5 rounded-md bg-red-50/50 border border-red-100">
                  <p className="text-lg font-semibold text-red-600">{stats.unmastered}</p>
                  <p className="text-xs text-red-500">待练</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-md bg-green-50/50 border border-green-100">
                  <p className="text-lg font-semibold text-green-600">{stats.mastered}</p>
                  <p className="text-xs text-green-500">已会</p>
                </div>
                <div className="text-center px-3 py-1.5 rounded-md bg-blue-50/50 border border-blue-100">
                  <p className="text-lg font-semibold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-blue-500">总计</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 筛选和刷新 */}
        <div className="flex items-center justify-between">
          <FilterTabs filter={filter} onFilterChange={setFilter} />
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>

        {/* 错题列表 */}
        {loading ? (
          <LoadingSpinner size="lg" text="加载中..." />
        ) : wrongQuestions.length > 0 ? (
          <div className="space-y-4">
            {wrongQuestions.map((question) => (
              <WrongQuestionCard
                key={question.id}
                question={question}
                loading={loadingAction === question.id}
                onMarkAsMastered={handleMarkAsMastered}
                onUnmarkAsMastered={handleUnmarkAsMastered}
              />
            ))}
          </div>
        ) : (
          <Card className="border-2 border-gray-300">
            <CardContent className="py-16 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl font-bold text-gray-800 mb-2">暂无错题</p>
              <p className="text-gray-600">继续保持，你很棒！</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


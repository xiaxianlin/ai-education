/**
 * 练习记录页面
 * 展示每日练习、单元练习和能力评测的历史记录
 */
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Calendar, BookOpen, TrendingUp, Trophy, Eye, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/biz/LoadingSpinner';
import { usePracticeHistory, TabType } from './hooks/usePracticeHistory';
import { cn } from '@/lib/utils';
import { useNavigate } from '@tanstack/react-router';

export function PracticeHistory() {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    dailyHistory,
    unitHistory,
    assessmentHistory,
    loading,
    formatDate,
    formatTime,
  } = usePracticeHistory();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在加载..." />
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'daily', label: '每日练习', icon: <Calendar className="h-5 w-5" />, count: dailyHistory.length },
    { key: 'unit', label: '单元练习', icon: <BookOpen className="h-5 w-5" />, count: unitHistory.length },
    { key: 'assessment', label: '能力评测', icon: <TrendingUp className="h-5 w-5" />, count: assessmentHistory.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 头部 */}
        <Card className="border-2 border-pink-300 shadow-lg bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-center gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full shadow-lg bg-gradient-to-br from-purple-400 to-blue-500">
                <Trophy className="h-8 w-8 text-white drop-shadow-md" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  练习记录
                </h1>
                <p className="text-sm font-semibold text-purple-700 mt-1">查看你的学习历程</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 选项卡 */}
        <div className="flex gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 py-4 px-4 rounded-2xl font-bold text-base transition-all duration-300',
                'border-2 shadow-lg flex items-center justify-center gap-2',
                activeTab === tab.key
                  ? 'bg-purple-500 text-white border-purple-400 shadow-xl scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:shadow-xl'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={cn(
                'ml-1 px-2 py-0.5 rounded-full text-xs font-bold',
                activeTab === tab.key ? 'bg-white/30' : 'bg-purple-100 text-purple-700'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* 记录列表 */}
        <div className="space-y-4">
          {activeTab === 'daily' && (
            dailyHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dailyHistory.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className="border-2 border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/30"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* 头部 */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 shadow-md">
                            <Calendar className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-bold text-gray-800">每日练习</div>
                            <div className="text-sm text-gray-600">{formatDate(item.date)}</div>
                          </div>
                          <div className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-bold',
                            item.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          )}>
                            {item.status === 'completed' ? '✓ 已完成' : '未完成'}
                          </div>
                        </div>

                        {/* 统计数据 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="text-xl font-bold text-blue-600">{item.score.toFixed(0)}</div>
                            <div className="text-xs text-gray-600 mt-1">得分</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
                            <div className="text-xl font-bold text-green-600">{item.correct_questions}/{item.total_questions}</div>
                            <div className="text-xs text-gray-600 mt-1">正确数</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-orange-50 border border-orange-100">
                            <div className="text-xl font-bold text-orange-600">{formatTime(item.total_time)}</div>
                            <div className="text-xs text-gray-600 mt-1">用时</div>
                          </div>
                        </div>

                        {/* 查看详情按钮 */}
                        {item.status === 'completed' && (
                          <button
                            onClick={() => navigate({ to: `/practice/${item.id}` })}
                            className="w-full py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <Eye className="h-4 w-4" />
                            查看详情
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-xl font-bold text-gray-800 mb-2">还没有每日练习记录</p>
                  <p className="text-sm text-gray-600">开始你的第一次每日练习吧！</p>
                </CardContent>
              </Card>
            )
          )}

          {activeTab === 'unit' && (
            unitHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unitHistory.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className="border-2 border-purple-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-purple-50/30"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* 头部 */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-md">
                            <BookOpen className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-bold text-gray-800">{item.unit_name}</div>
                            <div className="text-sm text-gray-600">{formatDate(item.practice_date)} · {item.difficulty}</div>
                          </div>
                          <div className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-bold',
                            item.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          )}>
                            {item.status === 'completed' ? '✓ 已完成' : '未完成'}
                          </div>
                        </div>

                        {/* 统计数据 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="text-xl font-bold text-blue-600">{item.score.toFixed(0)}</div>
                            <div className="text-xs text-gray-600 mt-1">得分</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
                            <div className="text-xl font-bold text-green-600">{item.correct_questions}/{item.total_questions}</div>
                            <div className="text-xs text-gray-600 mt-1">正确数</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-orange-50 border border-orange-100">
                            <div className="text-xl font-bold text-orange-600">{formatTime(item.total_time)}</div>
                            <div className="text-xs text-gray-600 mt-1">用时</div>
                          </div>
                        </div>

                        {/* 查看详情按钮 */}
                        {item.status === 'completed' && (
                          <button
                            onClick={() => navigate({ to: `/practice/${item.id}` })}
                            className="w-full py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <Eye className="h-4 w-4" />
                            查看详情
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-xl font-bold text-gray-800 mb-2">还没有单元练习记录</p>
                  <p className="text-sm text-gray-600">开始你的第一次单元练习吧！</p>
                </CardContent>
              </Card>
            )
          )}

          {activeTab === 'assessment' && (
            assessmentHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessmentHistory.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className="border-2 border-green-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/30"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* 头部 */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-md">
                            <TrendingUp className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-bold text-gray-800">能力评测</div>
                            <div className="text-sm text-gray-600">
                              {item.start_time ? formatDate(Math.floor(item.start_time / 1000)) : '暂无日期'} · {item.assessment_type}
                            </div>
                          </div>
                          <div className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-bold',
                            item.status === 'completed' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          )}>
                            {item.status === 'completed' ? '✓ 已完成' : '进行中'}
                          </div>
                        </div>

                        {/* 统计数据 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <div className="text-xl font-bold text-blue-600">{item.overall_score.toFixed(0)}</div>
                            <div className="text-xs text-gray-600 mt-1">总分</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-100">
                            <div className="text-lg font-bold text-purple-600">{item.ability_level}</div>
                            <div className="text-xs text-gray-600 mt-1">能力等级</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
                            <div className="text-xl font-bold text-green-600">{item.answered_count}</div>
                            <div className="text-xs text-gray-600 mt-1">答题数</div>
                          </div>
                        </div>

                        {/* 查看详情按钮 */}
                        {item.status === 'completed' && (
                          <button
                            onClick={() => navigate({ to: `/practice/${item.id}` })}
                            className="w-full py-2.5 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <Eye className="h-4 w-4" />
                            查看详情
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-gray-300 shadow-lg">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-xl font-bold text-gray-800 mb-2">还没有能力评测记录</p>
                  <p className="text-sm text-gray-600">开始你的第一次能力评测吧！</p>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>

      {/* 添加关键帧动画 */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}


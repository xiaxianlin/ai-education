/**
 * 练习记录页面
 * 展示每日练习、单元练习和能力评测的历史记录
 */
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/biz/Header';
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
    getUnitName,
    calculateScore,
    calculateTimeSpent,
    formatDate,
    formatTime,
    getStatusText,
    isCompleted,
  } = usePracticeHistory();

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-12 flex items-center justify-center">
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
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 头部 */}
        <Card className="border-2 border-primary/20 shadow-lg bg-card">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-center gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full shadow-lg bg-primary/10">
                <Trophy className="h-8 w-8 text-primary drop-shadow-md" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-primary">
                  练习记录
                </h1>
                <p className="text-sm font-semibold text-muted-foreground mt-1">查看你的学习历程</p>
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
                  ? 'bg-primary text-primary-foreground border-primary shadow-xl scale-105'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:shadow-xl'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={cn(
                'ml-1 px-2 py-0.5 rounded-full text-xs font-bold',
                activeTab === tab.key ? 'bg-white/30' : 'bg-primary/10 text-primary'
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
                {dailyHistory.map((item, index) => {
                  const score = calculateScore(item);
                  const timeSpent = calculateTimeSpent(item);
                  const completed = isCompleted(item.status);
                  return (
                  <Card 
                      key={item.session_id} 
                    className="border-2 border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-card"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* 头部 */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 shadow-md">
                            <Calendar className="h-7 w-7 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-bold text-foreground">每日练习</div>
                              <div className="text-sm text-muted-foreground">{formatDate(item)}</div>
                          </div>
                          <div className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-bold',
                              completed 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                              : 'bg-muted text-muted-foreground'
                          )}>
                              {completed ? '✓ 已完成' : getStatusText(item.status)}
                          </div>
                        </div>

                        {/* 统计数据 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                              <div className="text-xl font-bold text-primary">{score}</div>
                            <div className="text-xs text-muted-foreground mt-1">得分</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                              <div className="text-xl font-bold text-green-600 dark:text-green-400">{item.correct_count}/{item.question_count}</div>
                            <div className="text-xs text-muted-foreground mt-1">正确数</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatTime(timeSpent)}</div>
                            <div className="text-xs text-muted-foreground mt-1">用时</div>
                          </div>
                        </div>

                        {/* 查看详情按钮 */}
                          {completed && (
                          <button
                              onClick={() => navigate({ to: `/practice/${item.session_id}` })}
                            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <Eye className="h-4 w-4" />
                            查看详情
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-2 border-border shadow-lg bg-card">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-xl font-bold text-foreground mb-2">还没有每日练习记录</p>
                  <p className="text-sm text-muted-foreground">开始你的第一次每日练习吧！</p>
                </CardContent>
              </Card>
            )
          )}

          {activeTab === 'unit' && (
            unitHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unitHistory.map((item, index) => {
                  const score = calculateScore(item);
                  const timeSpent = calculateTimeSpent(item);
                  const completed = isCompleted(item.status);
                  const unitName = getUnitName(item.target_id);
                  return (
                  <Card 
                      key={item.session_id} 
                    className="border-2 border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-card"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* 头部 */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary/20 shadow-md">
                            <BookOpen className="h-7 w-7 text-secondary-foreground" />
                          </div>
                          <div className="flex-1">
                              <div className="text-lg font-bold text-foreground">{unitName}</div>
                              <div className="text-sm text-muted-foreground">{formatDate(item)}</div>
                          </div>
                          <div className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-bold',
                              completed 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                              : 'bg-muted text-muted-foreground'
                          )}>
                              {completed ? '✓ 已完成' : getStatusText(item.status)}
                          </div>
                        </div>

                        {/* 统计数据 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                              <div className="text-xl font-bold text-primary">{score}</div>
                            <div className="text-xs text-muted-foreground mt-1">得分</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                              <div className="text-xl font-bold text-green-600 dark:text-green-400">{item.correct_count}/{item.question_count}</div>
                            <div className="text-xs text-muted-foreground mt-1">正确数</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatTime(timeSpent)}</div>
                            <div className="text-xs text-muted-foreground mt-1">用时</div>
                          </div>
                        </div>

                        {/* 查看详情按钮 */}
                          {completed && (
                          <button
                              onClick={() => navigate({ to: `/practice/${item.session_id}` })}
                            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <Eye className="h-4 w-4" />
                            查看详情
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-2 border-border shadow-lg bg-card">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-xl font-bold text-foreground mb-2">还没有单元练习记录</p>
                  <p className="text-sm text-muted-foreground">开始你的第一次单元练习吧！</p>
                </CardContent>
              </Card>
            )
          )}

          {activeTab === 'assessment' && (
            assessmentHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessmentHistory.map((item, index) => {
                  const score = calculateScore(item);
                  const timeSpent = calculateTimeSpent(item);
                  const completed = isCompleted(item.status);
                  return (
                  <Card 
                      key={item.session_id} 
                    className="border-2 border-primary/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-card"
                    style={{
                      animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        {/* 头部 */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/20 shadow-md">
                            <TrendingUp className="h-7 w-7 text-accent-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="text-lg font-bold text-foreground">能力评测</div>
                              <div className="text-sm text-muted-foreground">{formatDate(item)}</div>
                          </div>
                          <div className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-bold',
                              completed 
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                              : 'bg-muted text-muted-foreground'
                          )}>
                              {completed ? '✓ 已完成' : getStatusText(item.status)}
                          </div>
                        </div>

                        {/* 统计数据 */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                              <div className="text-xl font-bold text-primary">{score}</div>
                              <div className="text-xs text-muted-foreground mt-1">得分</div>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-green-500/5 border border-green-500/10">
                              <div className="text-xl font-bold text-green-600 dark:text-green-400">{item.correct_count}/{item.question_count}</div>
                              <div className="text-xs text-muted-foreground mt-1">正确数</div>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-orange-500/5 border border-orange-500/10">
                              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatTime(timeSpent)}</div>
                              <div className="text-xs text-muted-foreground mt-1">用时</div>
                          </div>
                        </div>

                        {/* 查看详情按钮 */}
                          {completed && (
                          <button
                              onClick={() => navigate({ to: `/practice/${item.session_id}` })}
                            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <Eye className="h-4 w-4" />
                            查看详情
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-2 border-border shadow-lg bg-card">
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-xl font-bold text-foreground mb-2">还没有能力评测记录</p>
                  <p className="text-sm text-muted-foreground">开始你的第一次能力评测吧！</p>
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


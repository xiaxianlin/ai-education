import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { BookOpen, Play, Sparkles, X, Lightbulb } from 'lucide-react';
import { profileApi, Unit, Textbook, Knowledge } from '@/services/profile';
import { practiceApi } from '@/services/practice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function UnitPractice() {
  const navigate = useNavigate();
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentTextbook, setCurrentTextbook] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [knowledgeModal, setKnowledgeModal] = useState<{
    open: boolean;
    unitName: string;
    knowledges: Knowledge[];
  }>({ open: false, unitName: '', knowledges: [] });
  const [practiceModal, setPracticeModal] = useState<{
    open: boolean;
    unitId: number;
    unitName: string;
  }>({ open: false, unitId: 0, unitName: '' });
  const [difficulty, setDifficulty] = useState<string>('adaptive');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [creating, setCreating] = useState(false);
  const knowledgePreviewLimit = 6;

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      // 获取当前教材信息
      const profile = await profileApi.getProfile();
      if (!profile?.current_textbook_id) {
        setUnits([]);
        setCurrentTextbook(null);
        return;
      }

      // 获取教材详情
      const textbooks = await profileApi.getTextbooks();
      const textbook = textbooks.find((t) => t.id === profile.current_textbook_id);
      setCurrentTextbook(textbook || null);

      // 获取当前教材的单元列表
      const unitsData = await profileApi.getUnits(profile.current_textbook_id);
      // 只显示状态为启用(status=1)的单元，并过滤启用的知识点
      const enabledUnits = unitsData
        .filter((unit) => unit.status === 1)
        .map((unit) => ({
          ...unit,
          knowledges: (unit.knowledges || []).filter((knowledge) => knowledge.status === 1),
        }));
      setUnits(enabledUnits);
    } catch (error: any) {
      console.error('Failed to load units:', error);
      toast.error('加载单元信息失败');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  // 为每个单元分配不同的颜色主题（使用更淡的颜色）
  const colorThemes = [
    { bg: 'from-blue-50/80 to-cyan-50/80', border: 'border-blue-100', icon: 'text-blue-400', button: 'bg-blue-400 hover:bg-blue-500', shadow: 'shadow-blue-50' },
    { bg: 'from-pink-50/80 to-rose-50/80', border: 'border-pink-100', icon: 'text-pink-400', button: 'bg-pink-400 hover:bg-pink-500', shadow: 'shadow-pink-50' },
    { bg: 'from-green-50/80 to-emerald-50/80', border: 'border-green-100', icon: 'text-green-400', button: 'bg-green-400 hover:bg-green-500', shadow: 'shadow-green-50' },
    { bg: 'from-yellow-50/80 to-amber-50/80', border: 'border-yellow-100', icon: 'text-yellow-400', button: 'bg-yellow-400 hover:bg-yellow-500', shadow: 'shadow-yellow-50' },
    { bg: 'from-purple-50/80 to-violet-50/80', border: 'border-purple-100', icon: 'text-purple-400', button: 'bg-purple-400 hover:bg-purple-500', shadow: 'shadow-purple-50' },
    { bg: 'from-orange-50/80 to-red-50/80', border: 'border-orange-100', icon: 'text-orange-400', button: 'bg-orange-400 hover:bg-orange-500', shadow: 'shadow-orange-50' },
  ];

  const getColorTheme = (index: number) => colorThemes[index % colorThemes.length];

  const handleStartPractice = (unit: Unit) => {
    setPracticeModal({
      open: true,
      unitId: unit.id,
      unitName: unit.name,
    });
    setDifficulty('adaptive');
    setQuestionCount(10);
  };

  const handleCreatePractice = async () => {
    try {
      setCreating(true);
      const session = await practiceApi.createUnitPractice({
        unit_id: practiceModal.unitId,
        difficulty,
        count: questionCount,
      });
      toast.success('练习已创建，开始答题！');
      navigate(`/unit-practice/${session.id}`);
    } catch (error: any) {
      console.error('Failed to create practice:', error);
      toast.error(error.message || '创建练习失败');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-400 mx-auto"></div>
              <p className="mt-6 text-lg font-medium text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-purple-50/50 to-pink-50/50 pb-20">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 头部 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            单元练习
          </h1>
          <p className="text-gray-600 text-base">
            {currentTextbook 
              ? `当前教材：${currentTextbook.subject} ${currentTextbook.version} ${currentTextbook.grade}年级${currentTextbook.semester}`
              : '选择单元进行集中训练'}
          </p>
        </div>

        {/* 提示信息 */}
        {!currentTextbook && (
          <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50/80 to-amber-50/80 shadow-md">
            <CardContent className="pt-6 pb-6">
              <p className="text-base font-medium text-yellow-700 text-center">
                ⚠️ 请先在设置中选择当前学习教材
              </p>
            </CardContent>
          </Card>
        )}

        {/* 单元网格 */}
        {units.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {units.map((unit, index) => {
              const theme = getColorTheme(index);
              const knowledges = unit.knowledges || [];
              const hasMoreKnowledge = knowledges.length > knowledgePreviewLimit;
              return (
                <Card
                  key={unit.id}
                  className={cn(
                    'relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer h-full',
                    theme.border,
                    theme.shadow
                  )}
                >
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', theme.bg)} />
                  <CardContent className="relative z-10 p-4 h-full flex flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <div className={cn('p-2 rounded-xl bg-white/80 shadow-md flex-shrink-0', theme.bg)}>
                            <BookOpen className={cn('h-6 w-6', theme.icon)} />
                          </div>
                          <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
                            {unit.name}
                          </CardTitle>
                        </div>
                        {unit.content && (
                          <CardDescription className="text-xs text-gray-600 line-clamp-1">
                            {unit.content}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          onClick={() => handleStartPractice(unit)}
                          className={cn(
                            'rounded-full w-12 h-12 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center p-0',
                            theme.button
                          )}
                        >
                          <Play className="h-4 w-4" fill="currentColor" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-700">知识点</p>
                        {knowledges.length > 0 && !hasMoreKnowledge && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-gray-600 hover:text-gray-800 h-6 px-2"
                            onClick={() =>
                              setKnowledgeModal({
                                open: true,
                                unitName: unit.name,
                                knowledges,
                              })
                            }
                          >
                            查看全部
                          </Button>
                        )}
                      </div>

                      {knowledges.length > 0 ? (
                        <div className="relative">
                          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-hidden pr-2">
                            {knowledges.map((knowledge) => (
                              <span
                                key={knowledge.id}
                                className="px-2 py-0.5 rounded-full bg-white/80 border border-white text-xs text-gray-600 shadow-sm"
                              >
                                {knowledge.name}
                              </span>
                            ))}
                          </div>
                          {hasMoreKnowledge && (
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white/95 to-transparent flex items-end justify-end pr-2 pb-1.5 pointer-events-none">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="pointer-events-auto text-xs text-gray-700 h-6 px-2"
                                onClick={() =>
                                  setKnowledgeModal({
                                    open: true,
                                    unitName: unit.name,
                                    knowledges,
                                  })
                                }
                              >
                                查看全部
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">暂未设置知识点</p>
                      )}
                    </div>
                  </CardContent>
                  {/* 装饰性元素 */}
                  <div className={cn('absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10 blur-2xl', theme.bg)} />
                  <div className={cn('absolute -bottom-4 -left-4 w-32 h-32 rounded-full opacity-5 blur-3xl', theme.bg)} />
                </Card>
              );
            })}
          </div>
        )}

        {/* 空状态 */}
        {!loading && units.length === 0 && (
          <Card className="border-2 border-gray-200 bg-white/80 shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 mb-6">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">
                {currentTextbook ? '当前教材暂无单元练习' : '请先选择当前学习教材'}
              </p>
              {!currentTextbook && (
                <p className="text-sm text-gray-500 mt-2">
                  去设置页面选择你的学习教材吧！
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 知识点弹窗 */}
      {knowledgeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
              <div>
                <h2 className="text-xl font-bold text-gray-800">知识点</h2>
                <p className="text-sm text-gray-500 mt-1">{knowledgeModal.unitName}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setKnowledgeModal((prev) => ({ ...prev, open: false }))}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-3 bg-gradient-to-b from-white via-white to-purple-50/40">
              {knowledgeModal.knowledges.length > 0 ? (
                knowledgeModal.knowledges.map((knowledge) => (
                  <div
                    key={knowledge.id}
                    className="flex items-start gap-3 rounded-2xl border border-purple-100/70 bg-white/90 p-4 shadow-sm"
                  >
                    <div className="p-2 rounded-xl bg-purple-50/70 text-purple-500">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{knowledge.name}</p>
                      {knowledge.content && (
                        <p className="mt-1 text-sm text-gray-500 leading-relaxed">{knowledge.content}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">该单元暂未配置知识点。</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
              <Button onClick={() => setKnowledgeModal((prev) => ({ ...prev, open: false }))}>
                知道了
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 开始练习弹窗 */}
      {practiceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
              <div>
                <h2 className="text-xl font-bold text-gray-800">开始练习</h2>
                <p className="text-sm text-gray-500 mt-1">{practiceModal.unitName}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setPracticeModal({ open: false, unitId: 0, unitName: '' })}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* 难度选择 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">难度级别</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'easy', label: '简单', color: 'bg-green-50 border-green-200 text-green-700' },
                    { value: 'medium', label: '普通', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                    { value: 'hard', label: '困难', color: 'bg-red-50 border-red-200 text-red-700' },
                    { value: 'adaptive', label: '自适应', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDifficulty(option.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all',
                        difficulty === option.value
                          ? option.color
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 题目数量 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">题目数量</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={cn(
                        'px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all',
                        questionCount === count
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPracticeModal({ open: false, unitId: 0, unitName: '' })}
                className="flex-1"
              >
                取消
              </Button>
              <Button onClick={handleCreatePractice} disabled={creating} className="flex-1">
                {creating ? '创建中...' : '开始练习'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

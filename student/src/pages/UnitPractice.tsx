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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
              <p className="mt-6 text-lg font-medium text-gray-600 animate-pulse">正在加载...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* 头部卡片 - 一行内展示 */}
        <Card className="border-2 border-green-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="text-6xl">📚</div>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">单元练习</h1>
                <p className="text-base text-gray-600">
                  {currentTextbook 
                    ? `${currentTextbook.subject} · ${currentTextbook.grade}年级 ${currentTextbook.semester}`
                    : '选择你要练习的单元'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提示信息 */}
        {!currentTextbook && (
          <Card className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-100 to-orange-100 shadow-xl rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <p className="text-xl font-bold text-gray-800 mb-2">
                还没选教材呢！
              </p>
              <p className="text-base text-gray-600">
                去设置里选择你的学习教材吧~ 📖
              </p>
            </CardContent>
          </Card>
        )}

        {/* 单元网格 - 更大的卡片 */}
        {units.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {units.map((unit, index) => {
              const theme = getColorTheme(index);
              const knowledges = unit.knowledges || [];
              return (
                <Card
                  key={unit.id}
                  className={cn(
                    'relative overflow-hidden border-3 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl cursor-pointer rounded-3xl',
                    theme.border
                  )}
                >
                  <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', theme.bg)} />
                  <CardContent className="relative z-10 p-6 space-y-4">
                    {/* 单元标题和开始按钮 */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={cn('p-3 rounded-2xl bg-white/90 shadow-lg flex-shrink-0')}>
                          <BookOpen className={cn('h-8 w-8', theme.icon)} />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-800 leading-tight">
                          {unit.name}
                        </CardTitle>
                      </div>
                      <Button
                        onClick={() => handleStartPractice(unit)}
                        className={cn(
                          'rounded-2xl w-16 h-16 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center p-0 flex-shrink-0',
                          theme.button
                        )}
                      >
                        <Play className="h-7 w-7" fill="currentColor" />
                      </Button>
                    </div>

                    {/* 知识点标签 - 简化显示 */}
                    {knowledges.length > 0 ? (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {knowledges.slice(0, 4).map((knowledge) => (
                          <span
                            key={knowledge.id}
                            className="px-3 py-1.5 rounded-xl bg-white/90 border-2 border-white text-sm font-medium text-gray-700 shadow-sm"
                          >
                            {knowledge.name}
                          </span>
                        ))}
                        {knowledges.length > 4 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-3 py-1.5 h-auto rounded-xl text-sm font-medium text-gray-600 hover:bg-white/50"
                            onClick={() =>
                              setKnowledgeModal({
                                open: true,
                                unitName: unit.name,
                                knowledges,
                              })
                            }
                          >
                            +{knowledges.length - 4}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 pt-2">暂无知识点</p>
                    )}
                  </CardContent>
                  {/* 装饰性元素 - 更明显 */}
                  <div className={cn('absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20 blur-3xl', theme.bg)} />
                  <div className={cn('absolute -bottom-6 -left-6 w-36 h-36 rounded-full opacity-15 blur-3xl', theme.bg)} />
                </Card>
              );
            })}
          </div>
        )}

        {/* 空状态 - 更友好 */}
        {!loading && units.length === 0 && (
          <Card className="border-2 border-gray-300 bg-white shadow-2xl rounded-3xl">
            <CardContent className="py-16 text-center">
              <div className="text-7xl mb-6">📖</div>
              <p className="text-2xl font-bold text-gray-800 mb-3">
                {currentTextbook ? '这个教材还没有单元哦' : '还没有选教材呢'}
              </p>
              {!currentTextbook && (
                <p className="text-lg text-gray-600">
                  去设置里选一个吧！🎯
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

      {/* 开始练习弹窗 - 简化版 */}
      {practiceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">开始练习</h2>
                  <p className="text-base text-gray-600">{practiceModal.unitName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-800 rounded-full w-10 h-10"
                  onClick={() => setPracticeModal({ open: false, unitId: 0, unitName: '' })}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="px-6 py-6 space-y-6">
              {/* 难度选择 - 更大更明显 */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-800">选难度</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'easy', label: '简单 😊', emoji: '😊', color: 'border-green-300 bg-green-50 text-green-700' },
                    { value: 'medium', label: '普通 😎', emoji: '😎', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
                    { value: 'hard', label: '困难 😤', emoji: '😤', color: 'border-red-300 bg-red-50 text-red-700' },
                    { value: 'adaptive', label: '自动 🤖', emoji: '🤖', color: 'border-blue-300 bg-blue-50 text-blue-700' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDifficulty(option.value)}
                      className={cn(
                        'h-16 rounded-2xl border-3 font-bold text-base transition-all duration-200',
                        difficulty === option.value
                          ? option.color + ' scale-105 shadow-lg'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 题目数量 - 更大 */}
              <div className="space-y-3">
                <label className="block text-lg font-bold text-gray-800">做几题？</label>
                <div className="grid grid-cols-4 gap-3">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={cn(
                        'h-16 rounded-2xl border-3 font-bold text-xl transition-all duration-200',
                        questionCount === count
                          ? 'border-purple-400 bg-gradient-to-br from-purple-400 to-pink-500 text-white scale-110 shadow-xl'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300 shadow-md'
                      )}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPracticeModal({ open: false, unitId: 0, unitName: '' })}
                className="flex-1 h-14 text-lg rounded-2xl"
              >
                取消
              </Button>
              <Button 
                onClick={handleCreatePractice} 
                disabled={creating} 
                className="flex-1 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {creating ? '准备中...' : '开始 🚀'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

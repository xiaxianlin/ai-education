/**
 * 单元练习页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/biz/LoadingSpinner';
import { useUnitPracticePage } from './hooks/useUnitPracticePage';
import { UnitCard } from './components/UnitCard';
import { KnowledgeModal } from './components/KnowledgeModal';
import { PracticeModal } from './components/PracticeModal';
import { getColorTheme } from './utils/colorThemes';

export function UnitPractice() {
  const {
    units,
    currentTextbook,
    loading,
    knowledgeModal,
    practiceModal,
    difficulty,
    questionCount,
    creating,
    setDifficulty,
    setQuestionCount,
    handleStartPractice,
    handleCreatePractice,
    openKnowledgeModal,
    closeKnowledgeModal,
    closePracticeModal,
  } = useUnitPracticePage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <LoadingSpinner size="lg" text="正在加载..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* 头部卡片 */}
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
              <p className="text-xl font-bold text-gray-800 mb-2">还没选教材呢！</p>
              <p className="text-base text-gray-600">去设置里选择你的学习教材吧~ 📖</p>
            </CardContent>
          </Card>
        )}

        {/* 单元网格 */}
        {units.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {units.map((unit, index) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                theme={getColorTheme(index)}
                onStart={handleStartPractice}
                onShowKnowledge={openKnowledgeModal}
              />
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && units.length === 0 && (
          <Card className="border-2 border-gray-300 bg-white shadow-2xl rounded-3xl">
            <CardContent className="py-16 text-center">
              <div className="text-7xl mb-6">📖</div>
              <p className="text-2xl font-bold text-gray-800 mb-3">
                {currentTextbook ? '这个教材还没有单元哦' : '还没有选教材呢'}
              </p>
              {!currentTextbook && (
                <p className="text-lg text-gray-600">去设置里选一个吧！🎯</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 知识点弹窗 */}
      <KnowledgeModal
        open={knowledgeModal.open}
        unitName={knowledgeModal.unitName}
        knowledges={knowledgeModal.knowledges}
        onClose={closeKnowledgeModal}
      />

      {/* 开始练习弹窗 */}
      <PracticeModal
        open={practiceModal.open}
        unitName={practiceModal.unitName}
        difficulty={difficulty}
        questionCount={questionCount}
        creating={creating}
        onClose={closePracticeModal}
        onDifficultyChange={setDifficulty}
        onQuestionCountChange={setQuestionCount}
        onSubmit={handleCreatePractice}
      />
    </div>
  );
}


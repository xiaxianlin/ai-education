/**
 * 信息设置页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/biz/LoadingSpinner';
import { useSettings } from './hooks/useSettings';
import { TextbookCard } from './components/TextbookCard';

export function Settings() {
  const {
    textbooks,
    loading,
    saving,
    currentTextbookId,
    confirmDialog,
    getGradeLabel,
    handleSelectTextbook,
    handleConfirmSetTextbook,
    setConfirmDialog,
    navigate,
  } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在加载..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="设置当前学习教材"
        description={
          confirmDialog.textbookName
            ? `确定要将《${confirmDialog.textbookName}》设置为当前学习教材吗？`
            : '确定要设置此教材为当前学习教材吗？'
        }
        confirmText="确定"
        cancelText="取消"
        onConfirm={handleConfirmSetTextbook}
      />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-xl"
            onClick={() => navigate({ to: '/profile' })}
          >
            <ArrowLeft className="h-7 w-7" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-4xl">⚙️</div>
              <h1 className="text-3xl font-bold text-gray-800">我的设置</h1>
            </div>
            <p className="text-base text-gray-600">选择你正在学习的教材</p>
          </div>
        </div>

        {/* 我的教材列表 */}
        {textbooks.length > 0 ? (
          <Card className="border-2 border-purple-200 shadow-2xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-purple-100 via-blue-100 to-cyan-100 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                <BookOpen className="h-7 w-7 text-purple-600" />
                我的教材
              </CardTitle>
              <CardDescription className="text-center text-base text-gray-600">
                点击选择你正在用的教材
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {textbooks.map((textbook) => (
                  <TextbookCard
                    key={textbook.id}
                    textbook={textbook}
                    isCurrent={currentTextbookId === textbook.id}
                    saving={saving}
                    getGradeLabel={getGradeLabel}
                    onSelect={handleSelectTextbook}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-gray-300 shadow-2xl rounded-3xl">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="text-7xl mb-6">📚</div>
                <p className="text-2xl font-bold text-gray-800 mb-3">还没有教材呢</p>
                <p className="text-base text-gray-600">请联系老师为你添加教材 👨‍🏫</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


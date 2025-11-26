/**
 * 信息设置页面
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Header } from "@/components/business/Header";
import { AlertDialog } from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";
import { LoadingSpinner } from "@/components/business/LoadingSpinner";
import { useSettings } from "./hooks/useSettings";
import { TextbookCard } from "./views/TextbookCard";

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
  } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-12 flex items-center justify-center">
        <LoadingSpinner size="lg" text="正在加载..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title="设置当前学习教材"
        description={
          confirmDialog.textbookName
            ? `确定要将《${confirmDialog.textbookName}》设置为当前学习教材吗？`
            : "确定要设置此教材为当前学习教材吗？"
        }
        confirmText="确定"
        cancelText="取消"
        onConfirm={handleConfirmSetTextbook}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* 页面标题 */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            教材设置
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            选择你正在使用的教材，开始个性化学习之旅
          </p>
        </div>

        {/* 我的教材列表 */}
        {textbooks.length > 0 ? (
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-card animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-primary/5 pb-6 pt-8 border-b border-border">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                  我的教材
                </CardTitle>
              </div>
              <CardDescription className="text-center text-base text-muted-foreground">
                点击下方卡片选择你正在使用的教材
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {textbooks.map((textbook, index) => (
                  <div
                    key={textbook.id}
                    className="animate-in fade-in slide-in-from-bottom-4"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationDuration: "500ms",
                      animationFillMode: "both",
                    }}
                  >
                    <TextbookCard
                      textbook={textbook}
                      isCurrent={currentTextbookId === textbook.id}
                      saving={saving}
                      getGradeLabel={getGradeLabel}
                      onSelect={handleSelectTextbook}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg rounded-3xl overflow-hidden bg-card animate-in fade-in zoom-in-95 duration-500">
            <CardContent className="py-20 px-6">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div
                    className="text-8xl mb-2 animate-bounce"
                    style={{ animationDuration: "2s" }}
                  >
                    📚
                  </div>
                  <div
                    className="absolute -top-2 -right-2 text-4xl animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  >
                    ✨
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    还没有教材呢
                  </p>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
                    请联系老师为你添加教材，添加后即可开始学习
                  </p>
                </div>
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground">
                    <span className="text-xl">👨‍🏫</span>
                    <span className="text-sm font-medium">
                      等待老师添加教材
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

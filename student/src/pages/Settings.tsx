import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { GRADES } from '@/stores/useSettingsStore';
import { BookOpen, ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { profileApi, Textbook } from '@/services/profile';
import { toast } from 'sonner';

export function Settings() {
  const navigate = useNavigate();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTextbookId, setCurrentTextbookId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; textbookId: number | null; textbookName?: string }>({
    open: false,
    textbookId: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [textbooksData, profileData] = await Promise.all([
        profileApi.getTextbooks(),
        profileApi.getProfile(),
      ]);
      setTextbooks(textbooksData || []);
      if (profileData) {
        // 从profile中获取当前学习教材ID，如果没有则不设置默认值
        const currentId = profileData.current_textbook_id || null;
        setCurrentTextbookId(currentId);
      } else {
        // 如果没有profile数据，也不设置默认值
        setCurrentTextbookId(null);
      }
    } catch (error: any) {
      console.error('Failed to load data:', error);
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getGradeLabel = (grade: number) => {
    const gradeInfo = GRADES.find((g) => g.id === grade);
    return gradeInfo ? gradeInfo.label : `${grade}年级`;
  };

  const handleSelectTextbook = (textbookId: number) => {
    if (saving) return;
    const textbook = textbooks.find((t) => t.id === textbookId);
    setConfirmDialog({
      open: true,
      textbookId,
      textbookName: textbook?.subject,
    });
  };

  const handleConfirmSetTextbook = async () => {
    if (!confirmDialog.textbookId || saving) return;
    
    try {
      setSaving(true);
      // 更新当前学习教材
      await profileApi.updateProfile({
        current_textbook_id: confirmDialog.textbookId,
      });
      setCurrentTextbookId(confirmDialog.textbookId);
      toast.success('已设置为当前学习教材');
    } catch (error: any) {
      console.error('Failed to update current textbook:', error);
      toast.error('设置失败');
    } finally {
      setSaving(false);
      setConfirmDialog({ open: false, textbookId: null });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            onClick={() => navigate({ to: '/profile' })}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">信息设置</h1>
            <p className="text-sm text-muted-foreground">管理你的教材和学习设置</p>
          </div>
        </div>

        {/* 我的教材列表 */}
        {textbooks.length > 0 ? (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">我的教材</CardTitle>
              <CardDescription className="text-xs">
                选择一本教材作为当前学习教材
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {textbooks.map((textbook) => {
                  const isCurrent = currentTextbookId === textbook.id;
                  return (
                    <div
                      key={textbook.id}
                      className={cn(
                        'flex flex-col p-4 rounded-lg border transition-all cursor-pointer',
                        isCurrent
                          ? 'bg-blue-50 border-blue-300 shadow-md'
                          : 'bg-white border-gray-200/60 hover:border-gray-300 hover:shadow-sm'
                      )}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn(
                          'h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0',
                          isCurrent ? 'bg-blue-100' : 'bg-blue-50'
                        )}>
                          <BookOpen className={cn(
                            'h-6 w-6',
                            isCurrent ? 'text-blue-600' : 'text-blue-600'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <h3 className={cn(
                              'font-semibold text-sm truncate',
                              isCurrent ? 'text-blue-700' : 'text-gray-900'
                            )}>
                              {textbook.subject}
                            </h3>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-200 text-blue-700 flex-shrink-0">
                                <Check className="h-3 w-3" />
                                当前
                              </span>
                            )}
                          </div>
                          <div className={cn(
                            'flex flex-wrap items-center gap-1.5 text-xs',
                            isCurrent ? 'text-blue-600' : 'text-muted-foreground'
                          )}>
                            <span>{textbook.version}</span>
                            <span className={isCurrent ? 'text-blue-400' : 'text-gray-300'}>•</span>
                            <span>{getGradeLabel(textbook.grade)}</span>
                            <span className={isCurrent ? 'text-blue-400' : 'text-gray-300'}>•</span>
                            <span>{textbook.semester}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isCurrent ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          'w-full h-9 text-xs',
                          isCurrent && 'bg-blue-500 text-white hover:bg-blue-600'
                        )}
                        onClick={() => handleSelectTextbook(textbook.id)}
                        disabled={isCurrent || saving}
                      >
                        {isCurrent ? '当前教材' : '设为当前'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">暂无教材</p>
                <p className="text-sm text-muted-foreground mt-2">
                  请联系管理员为你添加教材
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          <p className="mt-6 text-lg font-medium text-gray-600 animate-pulse">正在加载...</p>
        </div>
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
        {/* 头部 - 更大更明显 */}
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

        {/* 我的教材列表 - 更大更友好 */}
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
                {textbooks.map((textbook) => {
                  const isCurrent = currentTextbookId === textbook.id;
                  return (
                    <div
                      key={textbook.id}
                      className={cn(
                        'flex flex-col p-6 rounded-2xl border-3 transition-all duration-300 shadow-lg hover:shadow-2xl',
                        isCurrent
                          ? 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-400 scale-105'
                          : 'bg-white border-gray-300 hover:border-blue-300 hover:scale-105'
                      )}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className={cn(
                          'h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md',
                          isCurrent ? 'bg-blue-200' : 'bg-blue-100'
                        )}>
                          <div className="text-4xl">📖</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={cn(
                              'font-bold text-lg',
                              isCurrent ? 'text-blue-800' : 'text-gray-900'
                            )}>
                              {textbook.subject}
                            </h3>
                            {isCurrent && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-500 text-white shadow-md">
                                <Check className="h-4 w-4" />
                                当前
                              </span>
                            )}
                          </div>
                          <div className={cn(
                            'flex flex-wrap items-center gap-2 text-sm font-medium',
                            isCurrent ? 'text-blue-700' : 'text-gray-600'
                          )}>
                            <span>{textbook.version}</span>
                            <span className={isCurrent ? 'text-blue-400' : 'text-gray-400'}>•</span>
                            <span>{getGradeLabel(textbook.grade)}</span>
                            <span className={isCurrent ? 'text-blue-400' : 'text-gray-400'}>•</span>
                            <span>{textbook.semester}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant={isCurrent ? "default" : "outline"}
                        size="lg"
                        className={cn(
                          'w-full h-14 text-lg font-bold rounded-2xl',
                          isCurrent 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg' 
                            : 'border-2 hover:bg-blue-50'
                        )}
                        onClick={() => handleSelectTextbook(textbook.id)}
                        disabled={isCurrent || saving}
                      >
                        {isCurrent ? '✓ 当前教材' : '选这个'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-gray-300 shadow-2xl rounded-3xl">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="text-7xl mb-6">📚</div>
                <p className="text-2xl font-bold text-gray-800 mb-3">还没有教材呢</p>
                <p className="text-base text-gray-600">
                  请联系老师为你添加教材 👨‍🏫
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

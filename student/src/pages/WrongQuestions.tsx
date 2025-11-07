import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { Header } from '@/components/layout/Header';
import { RefreshCw, Filter, BookOpen, Check, X } from 'lucide-react';
import { profileApi, WrongQuestion } from '@/services/profile';
import { toast } from 'sonner';

export function WrongQuestions() {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unmastered' | 'mastered'>('unmastered');
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  useEffect(() => {
    loadWrongQuestions();
  }, [filter]);

  const loadWrongQuestions = async () => {
    try {
      setLoading(true);
      const mastered = filter === 'all' ? undefined : filter === 'mastered' ? 1 : 0;
      const data = await profileApi.getWrongQuestions(mastered);
      setWrongQuestions(data);
    } catch (error: any) {
      console.error('Failed to load wrong questions:', error);
      toast.error('加载错题失败');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsMastered = async (questionId: number) => {
    try {
      setLoadingAction(questionId);
      await profileApi.markQuestionAsMastered(questionId);
      toast.success('已标记为已掌握');
      loadWrongQuestions();
    } catch (error: any) {
      console.error('Failed to mark as mastered:', error);
      toast.error('操作失败');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUnmarkAsMastered = async (questionId: number) => {
    try {
      setLoadingAction(questionId);
      await profileApi.unmarkQuestionAsMastered(questionId);
      toast.success('已标记为未掌握');
      loadWrongQuestions();
    } catch (error: any) {
      console.error('Failed to unmark as mastered:', error);
      toast.error('操作失败');
    } finally {
      setLoadingAction(null);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getTotalWrong = () => wrongQuestions.length;
  const getMasteredCount = () => wrongQuestions.filter(q => q.is_mastered === 1).length;
  const getUnmasteredCount = () => wrongQuestions.filter(q => q.is_mastered === 0).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部统计 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">错题集</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              未掌握 <span className="font-semibold text-foreground">{getUnmasteredCount()}</span> 道
            </span>
            <span className="text-muted-foreground">
              已掌握 <span className="font-semibold text-foreground">{getMasteredCount()}</span> 道
            </span>
            <span className="text-muted-foreground">
              合计 <span className="font-semibold text-foreground">{getTotalWrong()}</span> 道
            </span>
          </div>
        </div>

        {/* 筛选和操作栏 */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <Button
              variant={filter === 'unmastered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unmastered')}
            >
              未掌握
            </Button>
            <Button
              variant={filter === 'mastered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('mastered')}
            >
              已掌握
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              全部
            </Button>
          </div>
          <Button size="sm" onClick={loadWrongQuestions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 错题列表 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        ) : wrongQuestions.length > 0 ? (
          <div className="space-y-3">
            {wrongQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                          题目 #{question.question_id}
                        </span>
                        {question.is_mastered === 1 && (
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                            已掌握
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base font-medium line-clamp-2">
                        {question.question_content || '题目内容加载中...'}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>错 {question.wrong_count} 次</span>
                      <span>最后错误: {formatDate(question.last_wrong_time)}</span>
                    </div>
                    <div className="flex gap-2">
                      {question.is_mastered === 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsMastered(question.question_id)}
                          disabled={loadingAction === question.question_id}
                        >
                          {loadingAction === question.question_id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          <span className="ml-1">标记掌握</span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnmarkAsMastered(question.question_id)}
                          disabled={loadingAction === question.question_id}
                        >
                          {loadingAction === question.question_id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                          <span className="ml-1">取消掌握</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filter === 'unmastered' ? '暂无未掌握错题' :
                 filter === 'mastered' ? '暂无已掌握错题' : '暂无错题'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">继续努力，保持正确率！</p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

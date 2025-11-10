import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 pb-20">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部卡片 - 一行内展示 */}
        <Card className="border-2 border-red-300 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-6">
              {/* 标题 */}
              <div className="flex items-center gap-4">
                <div className="text-6xl">❌</div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">我的错题</h1>
                  <p className="text-base text-gray-600">巩固薄弱知识点</p>
                </div>
              </div>
              
              {/* 统计信息 */}
              <div className="flex items-center gap-6 text-base font-medium">
                <div className="text-center px-4 py-2 rounded-xl bg-red-50 border-2 border-red-200">
                  <p className="text-2xl font-bold text-red-600">{getUnmasteredCount()}</p>
                  <p className="text-xs text-red-600">待练</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-green-50 border-2 border-green-200">
                  <p className="text-2xl font-bold text-green-600">{getMasteredCount()}</p>
                  <p className="text-xs text-green-600">已会</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-blue-50 border-2 border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{getTotalWrong()}</p>
                  <p className="text-xs text-blue-600">总计</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 筛选按钮 - 更大更明显 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex gap-3">
            <Button
              variant={filter === 'unmastered' ? 'default' : 'outline'}
              className={`flex-1 h-14 text-lg font-bold rounded-2xl ${
                filter === 'unmastered' 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg' 
                  : 'border-2'
              }`}
              onClick={() => setFilter('unmastered')}
            >
              ❌ 待练
            </Button>
            <Button
              variant={filter === 'mastered' ? 'default' : 'outline'}
              className={`flex-1 h-14 text-lg font-bold rounded-2xl ${
                filter === 'mastered' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg' 
                  : 'border-2'
              }`}
              onClick={() => setFilter('mastered')}
            >
              ✅ 已会
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              className={`flex-1 h-14 text-lg font-bold rounded-2xl ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg' 
                  : 'border-2'
              }`}
              onClick={() => setFilter('all')}
            >
              📚 全部
            </Button>
          </div>
          <Button 
            className="h-14 w-14 rounded-2xl" 
            variant="outline" 
            onClick={loadWrongQuestions} 
            disabled={loading}
          >
            <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 错题列表 */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
            <p className="mt-6 text-lg font-medium text-gray-600 animate-pulse">正在加载...</p>
          </div>
        ) : wrongQuestions.length > 0 ? (
          <div className="space-y-4">
            {wrongQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 rounded-3xl hover:scale-[1.02]">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm px-3 py-1.5 rounded-xl bg-red-100 text-red-700 font-bold shadow-sm">
                          #{question.question_id}
                        </span>
                        {question.is_mastered === 1 && (
                          <span className="text-sm px-3 py-1.5 rounded-xl bg-green-100 text-green-700 font-bold shadow-sm">
                            ✅ 已掌握
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-800 line-clamp-2">
                        {question.question_content || '题目内容加载中...'}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
                      <span className="flex items-center gap-1">
                        <span className="text-red-500 text-lg">❌</span>
                        错 {question.wrong_count} 次
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>上次: {formatDate(question.last_wrong_time)}</span>
                    </div>
                    <div className="flex gap-2">
                      {question.is_mastered === 0 ? (
                        <Button
                          variant="outline"
                          className="h-12 px-6 text-base font-bold rounded-2xl border-2 border-green-300 hover:bg-green-50"
                          onClick={() => handleMarkAsMastered(question.question_id)}
                          disabled={loadingAction === question.question_id}
                        >
                          {loadingAction === question.question_id ? (
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <span className="mr-2">✅</span>
                          )}
                          我会了
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="h-12 px-6 text-base font-bold rounded-2xl border-2 border-gray-300 hover:bg-gray-50"
                          onClick={() => handleUnmarkAsMastered(question.question_id)}
                          disabled={loadingAction === question.question_id}
                        >
                          {loadingAction === question.question_id ? (
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <span className="mr-2">❌</span>
                          )}
                          取消
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-gray-300 shadow-2xl rounded-3xl">
            <CardContent className="py-16 text-center">
              <div className="text-7xl mb-6">
                {filter === 'unmastered' ? '🎉' :
                 filter === 'mastered' ? '💪' : '📚'}
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-3">
                {filter === 'unmastered' ? '太棒了！' :
                 filter === 'mastered' ? '继续加油！' : '暂无错题'}
              </p>
              <p className="text-base text-gray-600">
                {filter === 'unmastered' ? '没有待练的错题了' :
                 filter === 'mastered' ? '还没有掌握的题目' : '继续努力，保持正确率！'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

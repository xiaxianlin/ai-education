import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { RefreshCw, Filter, BookOpen } from 'lucide-react';

export function WrongQuestions() {
  // 模拟错题数据
  const wrongQuestions = [
    {
      id: 1,
      subject: '数学',
      knowledge: '分数的加减',
      question: '计算：1/3 + 1/6 = ?',
      wrongCount: 2,
      lastWrongAt: '2025-01-15',
    },
    {
      id: 2,
      subject: '英语',
      knowledge: '动词时态',
      question: 'I ___ to school yesterday.',
      wrongCount: 1,
      lastWrongAt: '2025-01-14',
    },
    {
      id: 3,
      subject: '数学',
      knowledge: '小数的乘法',
      question: '0.25 × 4 = ?',
      wrongCount: 3,
      lastWrongAt: '2025-01-13',
    },
  ];

  const totalWrong = 12; // 总错题数
  const todayReview = 3; // 今日复习数

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部统计 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">错题集</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              共有 <span className="font-semibold text-foreground">{totalWrong}</span> 道错题
            </span>
            <span className="text-muted-foreground">
              今日复习 <span className="font-semibold text-foreground">{todayReview}</span> 道
            </span>
          </div>
        </div>

        {/* 筛选和操作栏 */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button size="sm" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            一键再练
          </Button>
        </div>

        {/* 错题列表 */}
        <div className="space-y-3">
          {wrongQuestions.map((question) => (
            <Card key={question.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          question.subject === '数学'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {question.subject}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {question.knowledge}
                      </span>
                    </div>
                    <CardTitle className="text-base font-medium line-clamp-2">
                      {question.question}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>错 {question.wrongCount} 次</span>
                    <span>{question.lastWrongAt}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    再练
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态提示 */}
        {wrongQuestions.length === 0 && (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无错题</p>
              <p className="text-sm text-muted-foreground mt-2">继续努力，保持正确率！</p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

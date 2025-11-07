import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Trophy, RefreshCw, BookOpen, TrendingUp } from 'lucide-react';

export function DailyPracticeResult() {
  // 模拟结果数据
  const result = {
    total: 12,
    correct: 9,
    wrong: 3,
    duration: 18,
    accuracy: 75,
  };

  const errorTypes = [
    { type: '计算错误', count: 2 },
    { type: '概念理解', count: 1 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 完成动画提示 */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-4">
            <Trophy className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">练习完成！</h1>
          <p className="text-muted-foreground">你今天很棒！</p>
        </div>

        {/* 成绩卡 */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">今日成绩</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{result.correct}</p>
                <p className="text-sm text-muted-foreground mt-1">正确</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">{result.wrong}</p>
                <p className="text-sm text-muted-foreground mt-1">错误</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">{result.accuracy}%</p>
                <p className="text-sm text-muted-foreground mt-1">正确率</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">用时 {result.duration} 分钟</p>
            </div>
          </CardContent>
        </Card>

        {/* 错因分类 */}
        {errorTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">错因分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {errorTypes.map((error, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <span className="font-medium">{error.type}</span>
                    <span className="text-sm text-muted-foreground">{error.count} 题</span>
                  </div>
                ))}
              </div>
              <Link to="/wrong">
                <Button variant="outline" className="w-full mt-4">
                  查看错题详情
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 推荐操作 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <p className="font-medium">推荐下一步</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/wrong">
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    再练错题
                  </Button>
                </Link>
                <Link to="/unit-practice">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    单元练习
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 返回首页 */}
        <Link to="/home">
          <Button className="w-full" size="lg">
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
}

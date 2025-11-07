import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToHomeButton } from '@/components/BackToHomeButton';
import { Header } from '@/components/layout/Header';
import { Target, Clock, Award, TrendingUp, Play } from 'lucide-react';

export function Assessment() {
  const [hasCompleted, setHasCompleted] = useState(false);

  // 模拟评测报告数据
  const report = {
    level: '良好',
    accuracy: 78,
    totalQuestions: 25,
    duration: 22,
    weakPoints: [
      { knowledge: '分数的加减', accuracy: 60 },
      { knowledge: '小数的乘法', accuracy: 65 },
    ],
  };

  if (hasCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* 返回首页按钮 */}
          <div className="flex justify-end">
            <BackToHomeButton />
          </div>
          
          {/* 报告头部 */}
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
              <Award className="h-10 w-10 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">评测完成</h1>
            <p className="text-muted-foreground">你的能力等级：{report.level}</p>
          </div>

          {/* 总体成绩 */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-center">总体成绩</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-5xl font-bold text-purple-600 mb-2">{report.accuracy}%</p>
                <p className="text-muted-foreground">
                  完成 {report.totalQuestions} 道题，用时 {report.duration} 分钟
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 薄弱知识点 */}
          {report.weakPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">薄弱知识点</CardTitle>
                <CardDescription>建议加强以下知识点的练习</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.weakPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                    >
                      <span className="font-medium">{point.knowledge}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          正确率 {point.accuracy}%
                        </span>
                        <Button variant="outline" size="sm">
                          去练习
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 建议 */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <p className="font-medium">练习建议</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                建议继续加强薄弱知识点的练习，可以通过单元练习针对性地提高。
              </p>
              <Link to="/unit-practice">
                <Button variant="outline" className="w-full">
                  开始单元练习
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Link to="/home">
            <Button className="w-full" size="lg">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 返回首页按钮 */}
        <div className="flex justify-end">
          <BackToHomeButton />
        </div>
        
        {/* 头部 */}
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
            <Target className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">能力评测</h1>
          <p className="text-muted-foreground">了解你的知识掌握情况</p>
        </div>

        {/* 信息卡 */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle>评测说明</CardTitle>
            <CardDescription>完成评测后，系统会生成你的能力报告</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium">题量</p>
                <p className="text-sm text-muted-foreground">20-30 道题</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium">预计时间</p>
                <p className="text-sm text-muted-foreground">15-20 分钟</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium">奖励</p>
                <p className="text-sm text-muted-foreground">完成评测可获得成就徽章</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 开始按钮 */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => setHasCompleted(true)}
        >
          <Play className="h-5 w-5 mr-2" />
          开始评测
        </Button>

        <Link to="/home">
          <Button variant="outline" className="w-full">
            稍后再来
          </Button>
        </Link>
      </div>
    </div>
  );
}

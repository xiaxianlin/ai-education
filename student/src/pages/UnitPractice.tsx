import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToHomeButton } from '@/components/BackToHomeButton';
import { BookOpen, Play } from 'lucide-react';

export function UnitPractice() {
  const [selectedSubject, setSelectedSubject] = useState<'math' | 'english'>('math');

  // 模拟单元数据
  const mathUnits = [
    { id: 1, name: '第一单元：数的认识', knowledge: '数的读写、比较大小', questionCount: 15 },
    { id: 2, name: '第二单元：加减法', knowledge: '20以内加减法', questionCount: 18 },
    { id: 3, name: '第三单元：图形认识', knowledge: '基本图形识别', questionCount: 12 },
  ];

  const englishUnits = [
    { id: 1, name: 'Unit 1: Greetings', knowledge: '问候语、日常用语', questionCount: 16 },
    { id: 2, name: 'Unit 2: Numbers', knowledge: '数字1-20', questionCount: 14 },
    { id: 3, name: 'Unit 3: Colors', knowledge: '颜色词汇', questionCount: 13 },
  ];

  const units = selectedSubject === 'math' ? mathUnits : englishUnits;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">单元练习</h1>
            <p className="text-muted-foreground">选择单元进行集中训练</p>
          </div>
          <BackToHomeButton />
        </div>

        {/* 科目标签 */}
        <div className="flex gap-2">
          <Button
            variant={selectedSubject === 'math' ? 'default' : 'outline'}
            onClick={() => setSelectedSubject('math')}
            className="flex-1"
          >
            数学
          </Button>
          <Button
            variant={selectedSubject === 'english' ? 'default' : 'outline'}
            onClick={() => setSelectedSubject('english')}
            className="flex-1"
          >
            英语
          </Button>
        </div>

        {/* 单元列表 */}
        <div className="space-y-3">
          {units.map((unit) => (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {unit.name}
                </CardTitle>
                <CardDescription>{unit.knowledge}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {unit.questionCount} 道题
                  </span>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    开始练习
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 空状态 */}
        {units.length === 0 && (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">暂无单元练习</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

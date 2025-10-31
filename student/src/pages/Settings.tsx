import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { useSettingsStore, GRADES, TEXTBOOK_VERSIONS, SEMESTERS } from '@/stores/useSettingsStore';
import { BookOpen, GraduationCap, Calendar, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Settings() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettingsStore();
  const [grade, setGrade] = useState<number | null>(settings.grade);
  const [textbookVersion, setTextbookVersion] = useState<string | null>(settings.textbookVersion);
  const [semester, setSemester] = useState<string | null>(settings.semester);

  const canSubmit = grade !== null && textbookVersion !== null && semester !== null;

  const handleSubmit = () => {
    if (canSubmit) {
      updateSettings({
        grade,
        textbookVersion,
        semester,
      });
      navigate({ to: '/profile' });
    }
  };

  const currentGrade = GRADES.find((g) => g.id === settings.grade);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
            <h1 className="text-2xl font-bold">学习设置</h1>
            <p className="text-sm text-muted-foreground">修改你的年级和教材信息</p>
          </div>
        </div>

        {/* 当前设置 */}
        {currentGrade && settings.textbookVersion && settings.semester && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">当前设置</p>
              <div className="space-y-1">
                <p className="font-medium">
                  {currentGrade.label} · {settings.textbookVersion} · {settings.semester}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>修改设置</CardTitle>
            <CardDescription>
              请选择你的年级、教材版本和学期
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 年级选择 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <GraduationCap className="h-4 w-4" />
                年级
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GRADES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGrade(g.id)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm transition-colors',
                      grade === g.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent border-input'
                    )}
                  >
                    {g.grade}
                  </button>
                ))}
              </div>
            </div>

            {/* 教材版本选择 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                教材版本
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TEXTBOOK_VERSIONS.map((version) => (
                  <button
                    key={version}
                    onClick={() => setTextbookVersion(version)}
                    className={cn(
                      'px-3 py-2 rounded-lg border text-sm transition-colors',
                      textbookVersion === version
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent border-input'
                    )}
                  >
                    {version}
                  </button>
                ))}
              </div>
            </div>

            {/* 学期选择 */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                学期
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SEMESTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSemester(s)}
                    className={cn(
                      'px-4 py-2 rounded-lg border text-sm transition-colors',
                      semester === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background hover:bg-accent border-input'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* 提交按钮 */}
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              保存设置
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}

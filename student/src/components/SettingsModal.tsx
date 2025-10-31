import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettingsStore, GRADES, TEXTBOOK_VERSIONS, SEMESTERS } from '@/stores/useSettingsStore';
import { BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  onComplete?: () => void;
}

export function SettingsModal({ onComplete }: SettingsModalProps) {
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
        isInitialized: true,
      });
      onComplete?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">完善学习信息</CardTitle>
          <CardDescription>
            请设置你的年级和教材，以便系统为你推荐合适的练习内容
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
            完成设置
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

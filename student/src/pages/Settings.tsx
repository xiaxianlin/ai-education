import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { GRADES, TEXTBOOK_VERSIONS, SEMESTERS } from '@/stores/useSettingsStore';
import { BookOpen, GraduationCap, Calendar, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { profileApi, StudentProfile } from '@/services/profile';
import { toast } from 'sonner';

export function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [grade, setGrade] = useState<number | null>(null);
  const [textbookVersion, setTextbookVersion] = useState<string | null>(null);
  const [semester, setSemester] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      if (data) {
        setProfile(data);
        setGrade(data.grade || null);
        setTextbookVersion(data.textbook_version || null);
        setSemester(data.semester || null);
      }
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast.error('加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = grade !== null && textbookVersion !== null && semester !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setSaving(true);
      await profileApi.updateProfile({
        grade: grade!,
        textbook_version: textbookVersion!,
        semester: semester!,
      });
      toast.success('设置保存成功');
      navigate({ to: '/profile' });
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const currentGrade = grade ? GRADES.find((g) => g.id === grade) : null;

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
        {currentGrade && textbookVersion && semester && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">当前设置</p>
              <div className="space-y-1">
                <p className="font-medium">
                  {currentGrade.label} · {textbookVersion} · {semester}
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
              disabled={!canSubmit || saving}
              className="w-full"
              size="lg"
            >
              {saving ? '保存中...' : '保存设置'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}

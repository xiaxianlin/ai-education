/**
 * 设置弹窗组件
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui";
import { GRADES, GRADE_OPTIONS, SEMESTER_OPTIONS, SUBJECT_OPTIONS } from "@ai-education/shared-web";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  required?: boolean; // 是否必须设置（首次登录时）
}

export function SettingsDialog({ open, onOpenChange, required = false }: SettingsDialogProps) {
  const { profile, updateSettings } = useProfileModel();
  const [grade, setGrade] = useState<number>(profile?.grade || 1);
  const [semester, setSemester] = useState<string>(profile?.semester || "");
  const [subject, setSubject] = useState<string>(profile?.subject || "");
  const [loading, setLoading] = useState(false);

  // 获取可用教材选项
  const { data: availableOptions, loading: optionsLoading } = useRequest(
    () => studentApi.getAvailableTextbookOptions(),
    {
      ready: open,
    }
  );

  // 根据可用选项生成选项列表
  const gradeOptions = useMemo(() => {
    if (availableOptions?.grades && availableOptions.grades.length > 0) {
      return GRADE_OPTIONS.filter(opt => availableOptions.grades.includes(opt.value));
    }
    return GRADE_OPTIONS;
  }, [availableOptions]);

  const semesterOptions = useMemo(() => {
    if (availableOptions?.semesters && availableOptions.semesters.length > 0) {
      return SEMESTER_OPTIONS.filter(opt => availableOptions.semesters.includes(opt.value));
    }
    return SEMESTER_OPTIONS;
  }, [availableOptions]);

  const subjectOptions = useMemo(() => {
    if (availableOptions?.subjects && availableOptions.subjects.length > 0) {
      return SUBJECT_OPTIONS.filter(opt => availableOptions.subjects.includes(opt.value));
    }
    return SUBJECT_OPTIONS;
  }, [availableOptions]);

  // 当弹窗打开或 profile 更新时，同步初始值
  useEffect(() => {
    if (open && profile) {
      setGrade(profile.grade || 1);
      setSemester(profile.semester || "");
      setSubject(profile.subject || "");
    }
  }, [open, profile]);

  const handleSave = async () => {
    if (!semester || !subject) {
      toast.error("请完整填写所有设置项");
      return;
    }

    setLoading(true);
    try {
      await updateSettings({
        grade,
        semester,
        subject,
      });
      toast.success("设置保存成功");
      onOpenChange(false);
      // 重新加载页面以确保数据同步
      window.location.reload();
    } catch (error) {
      toast.error("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!required || !newOpen) {
      onOpenChange(newOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>学习设置</DialogTitle>
          <DialogDescription>
            {required ? "请先完成学习设置，以便我们为您推荐合适的学习内容" : "修改您的学习设置"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 年级选择 */}
          <div className="space-y-2">
            <label htmlFor="grade" className="text-sm font-medium">
              年级 <span className="text-destructive">*</span>
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 学期选择 */}
          <div className="space-y-2">
            <label htmlFor="semester" className="text-sm font-medium">
              学期 <span className="text-destructive">*</span>
            </label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">请选择学期</option>
              {semesterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 学科选择 */}
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              学科 <span className="text-destructive">*</span>
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">请选择学科</option>
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          {!required && (
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              取消
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading || !semester || !subject}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

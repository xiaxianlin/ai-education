/**
 * 设置弹窗组件
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { GRADES } from "@ai-education/shared-web";
import { uniqBy } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  required?: boolean; // 是否必须设置（首次登录时）
}

export function SettingsDialog({ open, onOpenChange, required = false }: SettingsDialogProps) {
  const { profile, updateSettings } = useProfileModel();
  const [subject, setSubject] = useState(profile?.subject);
  const [grade, setGrade] = useState(profile?.grade);
  const [semester, setSemester] = useState(profile?.semester);
  const [loading, setLoading] = useState(false);

  const { textbooks = [] } = profile || {};

  const subjectOptions = useMemo(() => {
    return uniqBy(
      textbooks.map(({ subject }) => ({ label: subject, value: subject })),
      "value"
    );
  }, [textbooks]);

  const gradeOptions = useMemo(() => {
    return uniqBy(
      textbooks.filter((item) => item.subject === subject).map(({ grade }) => ({ label: GRADES[grade], value: grade })),
      "value"
    );
  }, [textbooks, subject]);

  const semesterOptions = useMemo(() => {
    return textbooks
      .filter((item) => item.subject === subject && item.grade === grade)
      .map(({ semester }) => ({ label: semester, value: semester }));
  }, [textbooks, subject, grade]);

  // 当弹窗打开或 profile 更新时，同步初始值
  useEffect(() => {
    if (open && profile) {
      setSubject(profile.subject || "");
      setGrade(profile.grade || 1);
      setSemester(profile.semester || "");
    }
  }, [open, profile]);

  const handleSave = async () => {
    if (!semester || !subject) {
      toast.error("请完整填写所有设置项");
      return;
    }

    setLoading(true);
    try {
      await updateSettings({ grade: grade || 1, semester, subject });
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
          {/* 学科选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              学科 <span className="text-destructive">*</span>
            </label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择学科" />
              </SelectTrigger>
              <SelectContent>
                {subjectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* 年级选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              年级 <span className="text-destructive">*</span>
            </label>
            <Select value={grade ? String(grade) : undefined} onValueChange={(value) => setGrade(Number(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择年级" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* 学期选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              学期 <span className="text-destructive">*</span>
            </label>
            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择学期" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

/**
 * 信息设置页面逻辑 Hook
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GRADES } from "@/stores/settings-store";
import { profileApi } from "@/services/profile";
import { toast } from "sonner";
import { useApiError } from "@/hooks/useApiError";

export function useSettings() {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTextbookId, setCurrentTextbookId] = useState<number | null>(
    null
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    textbookId: number | null;
    textbookName?: string;
  }>({
    open: false,
    textbookId: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [textbooksData, checkResponse] = await Promise.all([
        profileApi.getTextbooks(),
        profileApi.check(),
      ]);
      setTextbooks(textbooksData || []);

      // 从教材列表中查找激活的教材，或者从 check 接口返回的教材获取
      const activeTextbook = textbooksData?.find((t) => t.active === 1);
      const currentId =
        activeTextbook?.id || checkResponse.textbook?.id || null;
      setCurrentTextbookId(currentId);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const getGradeLabel = useCallback((grade: number) => {
    const gradeInfo = GRADES.find((g) => g.id === grade);
    return gradeInfo ? gradeInfo.label : `${grade}年级`;
  }, []);

  const handleSelectTextbook = useCallback(
    (textbookId: number) => {
      if (saving) return;
      const textbook = textbooks.find((t) => t.id === textbookId);
      setConfirmDialog({
        open: true,
        textbookId,
        textbookName: textbook?.subject,
      });
    },
    [textbooks, saving]
  );

  const handleConfirmSetTextbook = useCallback(async () => {
    if (!confirmDialog.textbookId || saving) return;

    try {
      setSaving(true);
      // 使用新的激活教材接口
      await profileApi.activateTextbook(confirmDialog.textbookId);
      setCurrentTextbookId(confirmDialog.textbookId);

      // 更新教材列表中的 active 状态
      setTextbooks((prev) =>
        prev.map((t) => ({
          ...t,
          active: t.id === confirmDialog.textbookId ? 1 : 0,
        }))
      );

      toast.success("已设置为当前学习教材");

      // 关闭确认对话框
      setConfirmDialog({ open: false, textbookId: null });

      // 延迟刷新页面，让用户看到成功提示
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      handleError(error);
      setSaving(false);
      setConfirmDialog({ open: false, textbookId: null });
    }
  }, [confirmDialog, saving, handleError]);

  return {
    textbooks,
    loading,
    saving,
    currentTextbookId,
    confirmDialog,
    getGradeLabel,
    handleSelectTextbook,
    handleConfirmSetTextbook,
    setConfirmDialog,
    navigate,
  };
}

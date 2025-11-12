/**
 * 信息设置页面逻辑 Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { GRADES } from '@/stores/useSettingsStore';
import { profileApi, Textbook } from '@/services/profile';
import { toast } from 'sonner';
import { useApiError } from '@/lib/hooks/useApiError';

export function useSettings() {
  const navigate = useNavigate();
  const { handleError } = useApiError();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentTextbookId, setCurrentTextbookId] = useState<number | null>(null);
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
      const [textbooksData, profileData] = await Promise.all([
        profileApi.getTextbooks(),
        profileApi.getProfile(),
      ]);
      setTextbooks(textbooksData || []);
      if (profileData) {
        const currentId = profileData.current_textbook_id || null;
        setCurrentTextbookId(currentId);
      } else {
        setCurrentTextbookId(null);
      }
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

  const handleSelectTextbook = useCallback((textbookId: number) => {
    if (saving) return;
    const textbook = textbooks.find((t) => t.id === textbookId);
    setConfirmDialog({
      open: true,
      textbookId,
      textbookName: textbook?.subject,
    });
  }, [textbooks, saving]);

  const handleConfirmSetTextbook = useCallback(async () => {
    if (!confirmDialog.textbookId || saving) return;

    try {
      setSaving(true);
      await profileApi.updateProfile({
        current_textbook_id: confirmDialog.textbookId,
      });
      setCurrentTextbookId(confirmDialog.textbookId);
      toast.success('已设置为当前学习教材');
    } catch (error) {
      handleError(error);
    } finally {
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


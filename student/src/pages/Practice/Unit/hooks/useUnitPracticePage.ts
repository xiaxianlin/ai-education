/**
 * 单元练习页面逻辑 Hook
 * 负责单元练习页面的业务逻辑
 */
import { useState, useCallback } from "react";
import { textbookService } from "@/services/textbook";

export function useUnitPracticePage() {
  const [knowledgeModal, setKnowledgeModal] = useState<{
    open: boolean;
    unitName: string;
    knowledges: Knowledge[];
    loading?: boolean;
  }>({ open: false, unitName: "", knowledges: [], loading: false });
  const [practiceModal, setPracticeModal] = useState<{
    open: boolean;
    unitId: number;
    unitName: string;
  }>({ open: false, unitId: 0, unitName: "" });

  const openKnowledgeModal = useCallback(async (unit: Unit) => {
    // 先显示弹窗，设置加载状态
    setKnowledgeModal({
      open: true,
      unitName: unit.name,
      knowledges: [],
      loading: true,
    });

    try {
      // 调用接口获取单元知识点
      const knowledges = await textbookService.getUnitKnowledge(unit.id);
      setKnowledgeModal({
        open: true,
        unitName: unit.name,
        knowledges: knowledges || [],
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load knowledges:", error);
      // 加载失败，显示空列表
      setKnowledgeModal({
        open: true,
        unitName: unit.name,
        knowledges: [],
        loading: false,
      });
    }
  }, []);

  const closeKnowledgeModal = useCallback(() => {
    setKnowledgeModal((prev) => ({ ...prev, open: false }));
  }, []);

  const openPracticeModal = useCallback((unit: Unit) => {
    setPracticeModal({
      open: true,
      unitId: unit.id,
      unitName: unit.name,
    });
  }, []);

  const closePracticeModal = useCallback(() => {
    setPracticeModal({ open: false, unitId: 0, unitName: "" });
  }, []);

  return {
    // 数据
    knowledgeModal,
    practiceModal,
    // 方法
    openKnowledgeModal,
    closeKnowledgeModal,
    openPracticeModal,
    closePracticeModal,
  };
}

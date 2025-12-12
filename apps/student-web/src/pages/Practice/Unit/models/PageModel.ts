import { createContainer } from "unstated-next";
import { useProfileModel } from "@/models/ProfileModel";
import { useCallback, useState } from "react";
import { studentApi } from "@/lib/api";

interface KnowledgeModalState {
  open: boolean;
  unitName: string;
  knowledges: Knowledge[];
  loading?: boolean;
}

interface ConfirmModalState {
  open: boolean;
  unitId: number;
  unitName: string;
  textbookId: number;
}

const useContainer = () => {
  const { activeTextbooksMap } = useProfileModel();
  const [knowledgeModal, setKnowledgeModal] = useState<KnowledgeModalState>({
    open: false,
    unitName: "",
    knowledges: [],
    loading: false,
  });

  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    open: false,
    unitId: 0,
    unitName: "",
    textbookId: 0,
  });

  const openKnowledgeModal = useCallback(async (unit: Unit) => {
    setKnowledgeModal({
      open: true,
      unitName: unit.name,
      knowledges: [],
      loading: true,
    });

    try {
      const knowledges = await studentApi.getUnitKnowledge(unit.id);
      setKnowledgeModal({
        open: true,
        unitName: unit.name,
        knowledges: knowledges || [],
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load knowledges:", error);
      setKnowledgeModal({
        open: true,
        unitName: unit.name,
        knowledges: [],
        loading: false,
      });
    }
  }, []);

  const closeKnowledgeModal = useCallback(() => {
    setKnowledgeModal((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  const openConfirmModal = useCallback((unit: Unit) => {
    setConfirmModal({
      open: true,
      textbookId: unit.textbook_id,
      unitId: unit.id,
      unitName: unit.name,
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setConfirmModal({
      open: false,
      unitId: 0,
      unitName: "",
      textbookId: 0,
    });
  }, []);

  return {
    textbooks: activeTextbooksMap,
    knowledgeModal,
    confirmModal,
    openKnowledgeModal,
    closeKnowledgeModal,
    openConfirmModal,
    closeConfirmModal,
  };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;

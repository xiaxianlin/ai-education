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

const useContainer = () => {
  const { activeTextbooks } = useProfileModel();
  const [knowledgeModal, setKnowledgeModal] = useState<KnowledgeModalState>({
    open: false,
    unitName: "",
    knowledges: [],
    loading: false,
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

  return {
    textbooks: activeTextbooks,
    knowledgeModal,
    openKnowledgeModal,
    closeKnowledgeModal,
  };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;

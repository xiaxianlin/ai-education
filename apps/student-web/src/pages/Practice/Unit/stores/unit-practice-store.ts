/**
 * 单元练习页面状态管理 Store
 * 使用 zustand 管理单元练习页面的业务逻辑
 */
import { create } from "zustand";
import { studentApi } from "@ai-education/shared-student";
import { toast } from "sonner";

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

interface UnitPracticeStoreState {
  // 状态
  loading: boolean;
  practices: PracticeSession[];
  knowledgeModal: KnowledgeModalState;
  confirmModal: ConfirmModalState;

  // 方法
  openKnowledgeModal: (unit: Unit) => Promise<void>;
  closeKnowledgeModal: () => void;
  openConfirmModal: (unit: Unit) => void;
  closeConfirmModal: () => void;
  queryPractices: () => Promise<void>;
  createPractice: (textbookId: number, unitId: number) => Promise<void>;
}

export const useUnitPracticeStore = create<UnitPracticeStoreState>((set) => {
  return {
    // 初始状态
    loading: false,
    practices: [],
    knowledgeModal: {
      open: false,
      unitName: "",
      knowledges: [],
      loading: false,
    },

    confirmModal: {
      open: false,
      unitId: 0,
      unitName: "",
      textbookId: 0,
    },

    queryPractices: async () => {
      const practices = await studentApi.getUnitPractice();
      set({ practices });
    },
    createPractice: async (textbookId: number, unitId: number) => {
      try {
        set({ loading: true });
        await studentApi.createPractice({
          type: "unit_practice",
          textbook_id: textbookId,
          unit_id: unitId
        });
      } catch (error) {
        console.error("Failed to create practice:", error);
        toast.error("创建练习失败");
      } finally {
        set({ loading: false });
      }
    },

    // 打开知识点弹窗
    openKnowledgeModal: async (unit: Unit) => {
      // 先显示弹窗，设置加载状态
      set({
        knowledgeModal: {
          open: true,
          unitName: unit.name,
          knowledges: [],
          loading: true,
        },
      });

      try {
        // 调用接口获取单元知识点
        const knowledges = await studentApi.getUnitKnowledge(unit.id);
        set({
          knowledgeModal: {
            open: true,
            unitName: unit.name,
            knowledges: knowledges || [],
            loading: false,
          },
        });
      } catch (error) {
        console.error("Failed to load knowledges:", error);
        // 加载失败，显示空列表
        set({
          knowledgeModal: {
            open: true,
            unitName: unit.name,
            knowledges: [],
            loading: false,
          },
        });
      }
    },

    // 关闭知识点弹窗
    closeKnowledgeModal: () => {
      set((state) => ({
        knowledgeModal: {
          ...state.knowledgeModal,
          open: false,
        },
      }));
    },

    // 打开练习弹窗
    openConfirmModal: (unit: Unit) => {
      set({
        confirmModal: {
          open: true,
          textbookId: unit.textbook_id,
          unitId: unit.id,
          unitName: unit.name,
        },
      });
    },

    // 关闭练习弹窗
    closeConfirmModal: () => {
      set({
        confirmModal: {
          open: false,
          unitId: 0,
          unitName: "",
          textbookId: 0,
        },
      });
    },
  };
});

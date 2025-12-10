/**
 * 单元练习页面状态管理 Store
 * 使用 zustand 管理单元练习页面的业务逻辑
 */
import { create } from "zustand";
import { studentApi } from "@/lib/api";
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
  taskStatus: TaskStatus | null;
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

// 轮询配置
const POLLING_INTERVAL = 2000; // 2秒
const MAX_POLLING_COUNT = 150; // 最大轮询次数（5分钟）

export const useUnitPracticeStore = create<UnitPracticeStoreState>((set, get) => {
  let pollingTimer: ReturnType<typeof setTimeout> | null = null;
  let pollingCount = 0;

  // 清理轮询
  const clearPolling = () => {
    if (pollingTimer) {
      clearTimeout(pollingTimer);
      pollingTimer = null;
    }
    pollingCount = 0;
  };

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    pollingCount++;

    // 检查是否超过最大轮询次数
    if (pollingCount > MAX_POLLING_COUNT) {
      clearPolling();
      set({ loading: false, taskStatus: "FAILURE" });
      toast.error("练习生成超时，请稍后重试");
      return;
    }

    try {
      const status = await studentApi.getPracticeTaskStatus(taskId);
      set({ taskStatus: status });

      switch (status) {
        case "SUCCESS":
          clearPolling();
          set({ loading: false });
          // 刷新练习列表
          get().queryPractices();
          // 关闭确认弹窗
          get().closeConfirmModal();
          toast.success("练习生成成功");
          break;

        case "FAILURE":
          clearPolling();
          set({ loading: false });
          toast.error("练习生成失败");
          break;

        case "REVOKED":
          clearPolling();
          set({ loading: false });
          toast.info("任务已取消");
          break;

        case "PENDING":
        case "STARTED":
        case "RETRY":
          // 继续轮询
          pollingTimer = setTimeout(() => {
            pollTaskStatus(taskId);
          }, POLLING_INTERVAL);
          break;
      }
    } catch (error) {
      console.error("轮询任务状态失败:", error);
      // 网络错误时继续尝试轮询
      pollingTimer = setTimeout(() => {
        pollTaskStatus(taskId);
      }, POLLING_INTERVAL);
    }
  };

  return {
    // 初始状态
    loading: false,
    taskStatus: null,
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
      // 如果正在进行中，不重复提交
      if (get().loading) return;

      try {
        set({ loading: true, taskStatus: "PENDING" });
        clearPolling();

        // 提交创建任务
        const taskId = await studentApi.createPractice({
          type: "unit_practice",
          textbook_id: textbookId,
          unit_id: unitId,
        });

        if (taskId) {
          // 开始轮询任务状态
          pollingCount = 0;
          pollTaskStatus(taskId);
        } else {
          throw new Error("未获取到任务ID");
        }
      } catch (error) {
        console.error("Failed to create practice:", error);
        set({ loading: false, taskStatus: "FAILURE" });
        toast.error("创建练习失败");
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
      // 如果正在加载中，清理轮询
      if (get().loading) {
        clearPolling();
        set({ loading: false, taskStatus: null });
      }
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

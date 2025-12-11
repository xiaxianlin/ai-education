/**
 * 单元练习页面状态管理 Store
 * 使用 unstated-next 管理单元练习页面的业务逻辑
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createContainer } from "unstated-next";
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

interface UnitPracticeState {
  loading: boolean;
  taskStatus: TaskStatus | null;
  practices: PracticeSession[];
  knowledgeModal: KnowledgeModalState;
  confirmModal: ConfirmModalState;
}

interface UnitPracticeStoreValue extends UnitPracticeState {
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

const initialState: UnitPracticeState = {
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
};

function useUnitPracticeStoreInternal(): UnitPracticeStoreValue {
  const [state, setState] = useState<UnitPracticeState>(initialState);
  const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollingCountRef = useRef(0);

  const set = useCallback(
    (updater: Partial<UnitPracticeState> | ((prev: UnitPracticeState) => Partial<UnitPracticeState>)) => {
      setState((prev) => {
        const partial = typeof updater === "function" ? updater(prev) : updater;
        return { ...prev, ...partial };
      });
    },
    []
  );

  const clearPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    pollingCountRef.current = 0;
  }, []);

  const pollTaskStatus = useCallback(
    async (taskId: string) => {
      pollingCountRef.current++;

      if (pollingCountRef.current > MAX_POLLING_COUNT) {
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
            await queryPractices();
            closeConfirmModal();
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
            pollingTimerRef.current = setTimeout(() => {
              pollTaskStatus(taskId);
            }, POLLING_INTERVAL);
            break;
        }
      } catch (error) {
        console.error("轮询任务状态失败:", error);
        pollingTimerRef.current = setTimeout(() => {
          pollTaskStatus(taskId);
        }, POLLING_INTERVAL);
      }
    },
    [clearPolling, set]
  );

  const queryPractices = useCallback(async () => {
    const practices = await studentApi.getUnitPractice();
    set({ practices });
  }, [set]);

  const createPractice = useCallback(
    async (textbookId: number, unitId: number) => {
      if (state.loading) return;

      try {
        set({ loading: true, taskStatus: "PENDING" });
        clearPolling();

        const taskId = await studentApi.createPractice({
          type: "unit_practice",
          textbook_id: textbookId,
          unit_id: unitId,
        });

        if (taskId) {
          pollingCountRef.current = 0;
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
    [clearPolling, pollTaskStatus, set, state.loading]
  );

  const openKnowledgeModal = useCallback(
    async (unit: Unit) => {
      set({
        knowledgeModal: {
          open: true,
          unitName: unit.name,
          knowledges: [],
          loading: true,
        },
      });

      try {
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
    [set]
  );

  const closeKnowledgeModal = useCallback(() => {
    set((prev) => ({
      knowledgeModal: {
        ...prev.knowledgeModal,
        open: false,
      },
    }));
  }, [set]);

  const openConfirmModal = useCallback(
    (unit: Unit) => {
      set({
        confirmModal: {
          open: true,
          textbookId: unit.textbook_id,
          unitId: unit.id,
          unitName: unit.name,
        },
      });
    },
    [set]
  );

  const closeConfirmModal = useCallback(() => {
    if (state.loading) {
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
  }, [clearPolling, set, state.loading]);

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  return useMemo(
    () => ({
      ...state,
      openKnowledgeModal,
      closeKnowledgeModal,
      openConfirmModal,
      closeConfirmModal,
      queryPractices,
      createPractice,
    }),
    [
      closeConfirmModal,
      closeKnowledgeModal,
      createPractice,
      openConfirmModal,
      openKnowledgeModal,
      queryPractices,
      state,
    ]
  );
}

const UnitPracticeStore = createContainer(useUnitPracticeStoreInternal);

type UseUnitPracticeStore = {
  (): UnitPracticeStoreValue;
  <T>(selector: (state: UnitPracticeStoreValue) => T): T;
};

export const UnitPracticeProvider = UnitPracticeStore.Provider;
export const useUnitPracticeStore: UseUnitPracticeStore = ((selector?: (state: UnitPracticeStoreValue) => unknown) => {
  const store = UnitPracticeStore.useContainer();
  return selector ? selector(store) : store;
}) as UseUnitPracticeStore;

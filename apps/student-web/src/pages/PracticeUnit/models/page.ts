import { useProfileModel } from "@/common/models/ProfileModel";
import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useState } from "react";
import { createContainer } from "unstated-next";

/**
 * 单元练习页面状态管理
 * 包含单元列表等所有状态
 */
const useContainer = () => {
  const { activeTextbook } = useProfileModel();
  // 单元相关状态
  const [unit, setUnit] = useState<Unit>();

  // 单元列表请求
  const {
    data: units = [],
    loading: unitsLoading,
    error: unitsError,
  } = useRequest(
    () => {
      if (!activeTextbook?.id) {
        return Promise.resolve([]);
      }
      return studentApi.getTextbookUnits(activeTextbook.id);
    },
    {
      ready: !!activeTextbook?.id,
      refreshDeps: [activeTextbook?.id],
      onError: (error) => {
        console.error("获取单元列表失败:", error);
      },
    }
  );

  return {
    // 单元列表相关
    units,
    unitsLoading,
    unitsError,
    // 当前选中的单元
    unit,
    setUnit,
  };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;

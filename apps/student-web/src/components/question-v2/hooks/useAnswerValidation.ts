import { useCallback } from "react";
import type { InteractionType, QuestionOption } from "../types";

/**
 * 答案验证 Hook
 */
export function useAnswerValidation() {
  const validate = useCallback((type: InteractionType, value: string | string[], options?: QuestionOption[]) => {
    // 基础必填检查
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { isValid: false, message: "请先完成作答哦" };
    }

    // 根据题型进行特定逻辑验证
    switch (type) {
      case "multi_choice":
        if (Array.isArray(value) && value.length < 1) {
          return { isValid: false, message: "请至少选择一个选项" };
        }
        break;
      case "text_input":
      case "fill_blank":
        if (typeof value === "string" && value.trim().length === 0) {
          return { isValid: false, message: "请输入答案" };
        }
        break;
      // 其他题型可以在此扩展验证逻辑
    }

    return { isValid: true, message: "" };
  }, []);

  return { validate };
}

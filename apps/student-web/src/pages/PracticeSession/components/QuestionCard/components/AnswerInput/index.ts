/**
 * AnswerInput 组件统一导出
 * 根据交互类型返回对应的输入组件
 */

import { AudioInput } from "./AudioInput";
import { ChoiceInput } from "./ChoiceInput";
import { JudgeInput } from "./JudgeInput";
import { TextInput } from "./TextInput";

export { AudioInput } from "./AudioInput";
export { ChoiceInput } from "./ChoiceInput";
export { JudgeInput } from "./JudgeInput";
export { TextInput } from "./TextInput";

/**
 * 根据交互类型获取对应的输入组件
 */
export function getInputComponent(interactionType: string) {
  switch (interactionType) {
    // 选择题
    case "single_choice":
    case "multi_choice":
    case "image_choice":
      return ChoiceInput;

    // 判断题
    case "true_false":
    case "correct_wrong":
      return JudgeInput;

    // 文本输入
    case "text_input":
    case "fill_blank":
      return TextInput;

    // 语音输入
    case "voice_input":
    case "free_speak":
    case "follow_read":
      return AudioInput;

    // 其他交互类型暂用文本输入作为 fallback
    case "drag_drop":
    case "connect_line":
    case "sort_order":
    case "handwriting":
    case "multi_step":
      return TextInput;

    default:
      console.warn("[getInputComponent] Unknown interaction type:", interactionType);
      return null;
  }
}

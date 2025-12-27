/**
 * V2 交互输入组件导出
 */
export { ConnectLineInput } from "./ConnectLineInput";
export { DragDropInput } from "./DragDropInput";
export { FillBlankInput } from "./FillBlankInput";
export { HandwritingInput } from "./HandwritingInput";
export { MultiChoiceInput } from "./MultiChoiceInput";
export { SingleChoiceInput } from "./SingleChoiceInput";
export { SortOrderInput } from "./SortOrderInput";
export { TextInput } from "./TextInput";
export { TrueFalseInput } from "./TrueFalseInput";
export { VoiceInput } from "./VoiceInput";

// 交互类型与组件映射
import type { FC } from "react";
import type { InteractionInputProps, InteractionType } from "../types";
import { ConnectLineInput } from "./ConnectLineInput";
import { DragDropInput } from "./DragDropInput";
import { FillBlankInput } from "./FillBlankInput";
import { HandwritingInput } from "./HandwritingInput";
import { MultiChoiceInput } from "./MultiChoiceInput";
import { SingleChoiceInput } from "./SingleChoiceInput";
import { SortOrderInput } from "./SortOrderInput";
import { TextInput } from "./TextInput";
import { TrueFalseInput } from "./TrueFalseInput";
import { VoiceInput } from "./VoiceInput";

export const INTERACTION_INPUT_MAP: Partial<Record<InteractionType, FC<InteractionInputProps>>> = {
  single_choice: SingleChoiceInput,
  multi_choice: MultiChoiceInput,
  image_choice: SingleChoiceInput, // 复用单选，options 带图片
  true_false: TrueFalseInput,
  correct_wrong: TrueFalseInput,
  text_input: TextInput,
  fill_blank: FillBlankInput,
  // 以下交互类型待实现
  handwriting: HandwritingInput,
  voice_input: VoiceInput,
  drag_drop: DragDropInput,
  connect_line: ConnectLineInput,
  sort_order: SortOrderInput,
  // follow_read: FollowReadInput,
  // free_speak: FreeSpeakInput,
  // multi_step: MultiStepInput,
};

/** 获取交互输入组件 */
export function getInteractionInput(interactionType: InteractionType): FC<InteractionInputProps> | null {
  return INTERACTION_INPUT_MAP[interactionType] || null;
}

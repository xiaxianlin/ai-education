/**
 * 统一答题输入组件
 * 根据题目类型自动渲染对应的输入组件
 */
import { FC } from "react";
import { ChoiceInput } from "./ChoiceInput";
import { TextInput } from "./TextInput";
import { AudioInput } from "./AudioInput";
import type { AnswerInputProps } from "./types";

export const AnswerInput: FC<AnswerInputProps> = (props) => {
  const { question } = props;

  // 口语题使用录音组件
  if (question.type === "口语题") {
    return <AudioInput {...props} />;
  }

  // 选择题使用选项组件
  if (question.type === "选择题" || question.options) {
    return <ChoiceInput {...props} />;
  }

  // 其他题型使用文本输入
  return <TextInput {...props} />;
};

export type { AnswerInputProps } from "./types";

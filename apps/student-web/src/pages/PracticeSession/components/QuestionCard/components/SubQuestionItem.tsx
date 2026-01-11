/**
 * 单个子题组件
 * 每个子题包含题干和答题区域（紧凑版）
 */
import type { SubQuestionInputProps } from "../types";
import { getInputComponent } from "./AnswerInput";

/**
 * 从复合题的正确答案中提取子题的正确答案
 */
function extractSubQuestionCorrectAnswer(parentAnswer: PracticeAnswer | undefined, subQuestionId: string): unknown {
  if (!parentAnswer?.correct_answer) return undefined;

  const correctAnswer = parentAnswer.correct_answer;

  // 兼容旧数据：如果是字符串，返回 undefined（无法匹配子题）
  if (typeof correctAnswer === "string") {
    return undefined;
  }

  // 新数据格式：结构化对象
  if (typeof correctAnswer === "object") {
    const data = correctAnswer as any;

    // 复合题：从 sub_answers 中查找对应子题的正确答案
    if (data.sub_answers && Array.isArray(data.sub_answers)) {
      const subAnswer = data.sub_answers.find((sub: any) => String(sub.sub_id) === String(subQuestionId));
      if (subAnswer) {
        // 返回子题的正确答案结构，格式化为与单题相同的结构
        const subValue = subAnswer.value;
        const subInteractionType = subAnswer.type as string | undefined;
        const isMultiChoice = subInteractionType === "multi_choice";

        if (isMultiChoice && Array.isArray(subValue)) {
          return {
            type: subInteractionType,
            values: subValue,
          };
        } else {
          return {
            type: subInteractionType,
            value: subValue,
          };
        }
      }
    }
  }

  return undefined;
}

/**
 * 检查子题是否答错
 */
function isSubQuestionWrong(parentAnswer: PracticeAnswer | undefined, subQuestionId: string): boolean {
  if (!parentAnswer?.correct_answer) return false;

  const correctAnswer = parentAnswer.correct_answer;

  // 兼容旧数据：如果是字符串，无法判断
  if (typeof correctAnswer === "string") {
    return false;
  }

  // 新数据格式：结构化对象
  if (typeof correctAnswer === "object") {
    const data = correctAnswer as any;

    // 复合题：从 sub_answers 中查找对应子题的 is_correct 状态
    if (data.sub_answers && Array.isArray(data.sub_answers)) {
      const subAnswer = data.sub_answers.find((sub: any) => String(sub.sub_id) === String(subQuestionId));
      if (subAnswer && subAnswer.is_correct !== undefined) {
        return subAnswer.is_correct === false;
      }
    }
  }

  return false;
}

export function SubQuestionItem({
  subQuestion,
  index,
  value,
  disabled,
  onChange,
  parentAnswer,
}: SubQuestionInputProps) {
  const InputComponent = getInputComponent(subQuestion.interaction_type);

  // 获取题干文本
  const stemText = typeof subQuestion.stem === "string" ? subQuestion.stem : subQuestion.stem?.text || "";

  // 构造一个类 Question 对象给 InputComponent 使用
  // 子题的 options 需要传递给 ChoiceInput 等组件
  const subQuestionAsQuestion = {
    options: subQuestion.options?.map((opt: any) => ({
      id: opt.id || opt.label,
      text: opt.text || opt.label || opt.id,
      ...opt,
    })),
    question_type: {
      interaction_type: subQuestion.interaction_type,
    },
  } as Question;

  // 提取子题的正确答案
  const subQuestionCorrectAnswer = extractSubQuestionCorrectAnswer(parentAnswer, subQuestion.id);

  // 构造包含正确答案的 PracticeAnswer 对象
  const subQuestionAnswer: PracticeAnswer = {
    ...(parentAnswer || {}),
    answer: value,
    correct_answer: subQuestionCorrectAnswer as any,
  } as PracticeAnswer;

  // 检查子题是否答错
  const isWrong = isSubQuestionWrong(parentAnswer, subQuestion.id);
  // 获取子题解析
  const explanation = subQuestion.explanation;

  return (
    <div className="p-3 bg-secondary/20 rounded-xl border border-border/30">
      {/* 序号 + 题干 */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
          {index + 1}
        </div>
        <div className="text-sm font-medium leading-relaxed">{stemText}</div>
      </div>

      {/* 答题区域 */}
      <div className="pl-8">
        {InputComponent ? (
          <InputComponent
            question={subQuestionAsQuestion}
            value={subQuestionAnswer}
            disabled={disabled}
            onChange={(newAnswer) => {
              const answerValue = newAnswer.answer ?? "";
              onChange(typeof answerValue === "string" ? answerValue : String(answerValue));
            }}
          />
        ) : (
          <div className="text-xs text-muted-foreground italic">不支持的题型: {subQuestion.interaction_type}</div>
        )}
      </div>

      {/* 子题解析 - 仅在答错且已提交时显示 */}
      {disabled && isWrong && explanation && (
        <div className="mt-3 pl-8 pt-3 border-t border-border/30">
          <div className="rounded-lg border border-blue-500/40 bg-blue-50 p-3">
            <div className="text-xs text-foreground leading-relaxed flex items-start gap-1.5">
              <span className="flex-shrink-0">📖</span>
              <span className="flex-1 whitespace-pre-wrap">{explanation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

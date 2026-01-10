/**
 * 选择题输入组件
 * 支持 single_choice / multi_choice / image_choice
 */
import { CheckCircle } from "lucide-react";
import type { AnswerInputProps } from "../../types";

/**
 * 从正确答案中提取选项ID列表
 */
function extractCorrectAnswerIds(correctAnswer: unknown, isMultiChoice: boolean): string[] {
  if (!correctAnswer) return [];

  // 兼容旧数据：如果是字符串
  if (typeof correctAnswer === "string") {
    return [correctAnswer];
  }

  // 新数据格式：结构化对象
  if (typeof correctAnswer === "object") {
    const data = correctAnswer as Record<string, unknown>;
    
    // 多选题：使用 values 数组
    if (isMultiChoice && data.values && Array.isArray(data.values)) {
      return data.values.map((v) => String(v));
    }
    
    // 单选题：使用 value
    if (data.value !== undefined) {
      return [String(data.value)];
    }
    
    // 如果有 options 数组，提取 id
    if (data.options && Array.isArray(data.options)) {
      return data.options.map((opt: Record<string, unknown>) => String(opt.id || opt.value || ""));
    }
  }

  return [];
}

/**
 * 根据状态映射获取按钮的 className
 */
function getButtonClassName(params: {
  showFeedback: boolean;
  selected: boolean;
  isUserCorrect: boolean;
  isUserWrong: boolean;
  correct: boolean;
  disabled: boolean;
}): string {
  const base = "flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 shadow-sm relative";
  const classes: string[] = [base];
  
  if (!params.showFeedback) {
    // 答题状态
    if (params.selected) {
      classes.push("border-primary bg-primary/10 text-primary shadow-primary/20");
    } else {
      classes.push("border-border bg-card text-card-foreground hover:border-primary hover:bg-primary/5 hover:text-primary");
    }
  } else {
    // 反馈状态
    if (params.isUserCorrect) {
      classes.push("border-green-500 bg-green-50 text-green-700");
    } else if (params.isUserWrong) {
      classes.push("border-red-500 bg-red-50 text-red-700");
    } else if (params.correct) {
      classes.push("border-green-200 bg-green-50/50 text-foreground");
    } else {
      classes.push("border-border bg-card text-card-foreground");
    }
  }
  
  if (params.disabled) {
    classes.push("opacity-100 cursor-not-allowed");
  }
  
  return classes.join(" ");
}

export function ChoiceInput({ question, value, disabled, onChange }: AnswerInputProps) {
  // question.options 是 QuestionOption[]，需要转换为 { label, text } 格式
  const options: Array<{ label: string; text: string }> = (question?.options || []).map((opt) => ({
    label: opt.id,
    text: opt.text || opt.id,
  }));

  const interactionType = question?.question_type?.interaction_type;
  const isMultiChoice = interactionType === "multi_choice";

  // 从 answer.answer 读取答案
  const rawAnswer = value?.answer;
  let currentAnswer: string | string[] = "";
  
  if (rawAnswer) {
    try {
      const parsed = typeof rawAnswer === "string" ? JSON.parse(rawAnswer) : rawAnswer;
      if (isMultiChoice) {
        currentAnswer = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        currentAnswer = Array.isArray(parsed) ? parsed[0] : String(parsed);
      }
    } catch {
      currentAnswer = isMultiChoice ? (Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer]) : String(rawAnswer);
    }
  } else {
    currentAnswer = isMultiChoice ? [] : "";
  }

  // 提取正确答案ID列表
  const correctAnswerIds = extractCorrectAnswerIds(value?.correct_answer, isMultiChoice);

  const isSelected = (label: string) => {
    if (isMultiChoice) {
      return Array.isArray(currentAnswer) && currentAnswer.includes(label);
    } else {
      return currentAnswer === label;
    }
  };

  const isCorrect = (label: string) => {
    return correctAnswerIds.includes(label);
  };

  const handleClick = (label: string) => {
    if (disabled) return;

    let newAnswer: string | string[];
    if (isMultiChoice) {
      const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (currentArray.includes(label)) {
        // 取消选择
        newAnswer = currentArray.filter((item) => item !== label);
      } else {
        // 添加选择
        newAnswer = [...currentArray, label];
      }
    } else {
      // 单选题：直接替换
      newAnswer = label;
    }

    onChange({
      ...value,
      answer: newAnswer,
    } as PracticeAnswer);
  };

  return (
    <div className="grid gap-2 grid-cols-2">
      {options.map(({ label, text }) => {
        const selected = !!isSelected(label);
        const correct = !!isCorrect(label);
        
        // 在已提交状态下（disabled=true），根据用户选择和正确答案显示不同状态
        const showFeedback = !!(disabled && correctAnswerIds.length > 0);
        const isUserCorrect = !!(selected && correct);
        const isUserWrong = !!(selected && !correct);

        return (
          <button
            key={label}
            onClick={() => handleClick(label)}
            disabled={disabled}
            className={getButtonClassName({
              showFeedback,
              selected,
              isUserCorrect,
              isUserWrong,
              correct,
              disabled: !!disabled,
            })}
          >
            <div className="text-sm font-semibold text-center leading-snug flex-1">{text}</div>
            
            {/* 答题状态下的选中图标 */}
            {!showFeedback && selected && (
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
            )}
            
            {/* 反馈状态下的图标 */}
            {showFeedback && (
              <>
                {isUserCorrect && (
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                )}
                {isUserWrong && (
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-red-600" />
                  </div>
                )}
                {!selected && correct && (
                  <div className="absolute top-1 right-1 flex-shrink-0">
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">正确</span>
                  </div>
                )}
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

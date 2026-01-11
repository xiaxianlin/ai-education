/**
 * 解析区域组件
 * 展示正确答案、题目解析和 AI 分析
 */
import { CheckCircle, Lightbulb } from "lucide-react";

interface AnalysisSectionProps {
  answer: PracticeAnswer;
  question: Question;
}

/**
 * 根据选项 ID 获取选项文本
 */
function getOptionText(options: QuestionOption[] | undefined, optionId: string): string {
  if (!options) return optionId;
  const option = options.find((opt) => opt.id === optionId);
  return option?.text || optionId;
}

/**
 * 从结构化正确答案中提取显示文本
 * @param correctAnswer 正确答案数据
 * @param question 题目数据（用于获取选项文本）
 */
function formatCorrectAnswer(correctAnswer: unknown, question: Question): string {
  if (!correctAnswer) return "";

  // 兼容旧数据：如果是字符串，尝试匹配选项
  if (typeof correctAnswer === "string") {
    return getOptionText(question.options, correctAnswer);
  }

  // 新数据格式：结构化对象
  if (typeof correctAnswer === "object") {
    const data = correctAnswer as Record<string, unknown>;
    const subQuestions = question.stem?.sub_questions || (question.stem as any)?.subQuestions || [];
    const isComposite = data.type === "composite" || subQuestions.length > 0;

    // 复合题：展示子答案（匹配子题选项）
    if (data.sub_answers && Array.isArray(data.sub_answers) && data.sub_answers.length > 0) {
      return data.sub_answers
        .map((sub: Record<string, unknown>) => {
          const subId = sub.sub_id as string;
          const value = sub.value as string;

          // 找到对应的子题
          const subQuestion = subQuestions.find((sq: SubQuestion) => sq.id === subId);
          const subOptions = subQuestion?.options;

          // 获取选项文本
          const optionText = getOptionText(subOptions, value);

          // 获取子题题干（简短版）
          const stemText =
            typeof subQuestion?.stem === "string" ? subQuestion.stem : subQuestion?.stem?.text || `第${subId}题`;
          const shortStem = stemText.length > 15 ? stemText.slice(0, 15) + "..." : stemText;

          return `${shortStem}：${optionText}`;
        })
        .join("\n");
    }

    // 复合题：如果有 values 数组，按索引匹配子题
    if (isComposite && data.values && Array.isArray(data.values)) {
      return data.values
        .map((value, idx) => {
          const subQuestion = subQuestions[idx];
          if (!subQuestion) return String(value);

          const subOptions = subQuestion.options;
          const optionText = getOptionText(subOptions, String(value));

          // 获取子题题干（简短版）
          const stemText =
            typeof subQuestion.stem === "string" ? subQuestion.stem : subQuestion.stem?.text || `第${idx + 1}题`;
          const shortStem = stemText.length > 15 ? stemText.slice(0, 15) + "..." : stemText;

          return `${shortStem}：${optionText}`;
        })
        .join("\n");
    }

    // 非复合题：多值答案（多选题）
    if (data.values && Array.isArray(data.values)) {
      return data.values.map((v) => getOptionText(question.options, String(v))).join("、");
    }

    // 单值答案（优先使用选项详情中的文本）
    if (data.options && Array.isArray(data.options) && data.options.length > 0) {
      return data.options.map((opt: Record<string, unknown>) => opt.text || opt.id).join("、");
    }

    // 单值答案
    if (data.value !== undefined) {
      return getOptionText(question.options, String(data.value));
    }
  }

  return "";
}

/**
 * 判断是否为选择题
 */
function isChoiceQuestion(question: Question): boolean {
  const interactionType = question?.question_type?.interaction_type;
  return (
    interactionType === "single_choice" || interactionType === "multi_choice" || interactionType === "image_choice"
  );
}

/**
 * 判断复合题的所有子题是否都是选择题
 */
function isAllSubQuestionsChoice(question: Question): boolean {
  const subQuestions = question?.stem?.sub_questions || (question?.stem as any)?.subQuestions || [];
  if (subQuestions.length === 0) return false;

  return subQuestions.every((subQ: SubQuestion) => {
    const interactionType = subQ.interaction_type;
    return (
      interactionType === "single_choice" || interactionType === "multi_choice" || interactionType === "image_choice"
    );
  });
}

/**
 * 从分析对象中提取显示内容
 */
function formatAnalysis(analysis: unknown): { explanation?: string; analysis?: string } {
  if (!analysis) return {};

  // 兼容旧数据：如果是字符串，作为分析内容
  if (typeof analysis === "string") {
    return { analysis };
  }

  // 新数据格式：结构化对象
  if (typeof analysis === "object") {
    const data = analysis as Record<string, unknown>;
    return {
      explanation: data.explanation as string | undefined,
      analysis: data.analysis as string | undefined,
    };
  }

  return {};
}

export function AnalysisSection({ answer, question }: AnalysisSectionProps) {
  const correctAnswerText = formatCorrectAnswer(answer.correct_answer, question);
  const { analysis } = formatAnalysis(answer.analysis);

  // 判断是否应该隐藏"正确答案"文本
  // 如果是选择题（单题或复合题的所有子题都是选择题），则隐藏
  const shouldHideCorrectAnswer = isChoiceQuestion(question) || isAllSubQuestionsChoice(question);

  return (
    <div className="space-y-4 mt-6 p-6 rounded-2xl border-2 border-primary/20 bg-card">
      {/* 正确答案 - 仅在非选择题时显示 */}
      {!shouldHideCorrectAnswer && correctAnswerText && (
        <div className="rounded-xl border border-green-500/40 bg-green-50 p-4">
          <div className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>正确答案</span>
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{correctAnswerText}</div>
        </div>
      )}

      {/* AI 分析 */}
      {analysis && (
        <div className="rounded-xl border border-orange-500/40 bg-orange-50 p-4">
          <div className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>分析</span>
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{analysis}</div>
        </div>
      )}
    </div>
  );
}

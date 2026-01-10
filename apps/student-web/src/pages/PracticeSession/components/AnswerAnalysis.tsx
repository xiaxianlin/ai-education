import { Card, CardContent } from "@/components/ui";
import { CheckCircle, Lightbulb, BookOpen } from "lucide-react";
import { usePracticeSessionModel } from "../models/page";

/**
 * 从结构化正确答案中提取显示文本
 */
function formatCorrectAnswer(correctAnswer: unknown): string {
  if (!correctAnswer) return "";

  // 兼容旧数据：如果是字符串，直接返回
  if (typeof correctAnswer === "string") return correctAnswer;

  // 新数据格式：结构化对象
  if (typeof correctAnswer === "object") {
    const data = correctAnswer as Record<string, unknown>;

    // 复合题：展示子答案
    if (data.sub_answers && Array.isArray(data.sub_answers)) {
      return data.sub_answers
        .map((sub: Record<string, unknown>) => `${sub.sub_id}: ${sub.value}`)
        .join(", ");
    }

    // 多值答案
    if (data.values && Array.isArray(data.values)) {
      return data.values.join(", ");
    }

    // 单值答案（优先使用选项文本）
    if (data.options && Array.isArray(data.options) && data.options.length > 0) {
      const opt = data.options[0] as Record<string, unknown>;
      return `${opt.id}: ${opt.text}`;
    }

    // 单值答案
    if (data.value !== undefined) {
      return String(data.value);
    }

    // 兼容旧格式包装
    if (data.value !== undefined) {
      return String(data.value);
    }
  }

  return "";
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

/**
 * 答案解析组件
 * - 展示正确答案
 * - 展示题目解析（如果有）
 * - 展示 AI 分析结果（如果有）
 */
export function AnswerAnalysis() {
  const { answer } = usePracticeSessionModel();

  // 如果答案记录不存在或答案正确，则不显示
  if (!answer || answer.status !== 2) return null;

  const correctAnswerText = formatCorrectAnswer(answer.correct_answer);
  const { explanation, analysis } = formatAnalysis(answer.analysis);

  return (
    <Card className="border-2 border-primary/20 shadow-lg rounded-2xl bg-card">
      <CardContent className="p-6 space-y-5">
        {/* 正确答案 */}
        {correctAnswerText && (
          <div className="rounded-xl border border-green-500/40 bg-green-50 p-4">
            <div className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>正确答案</span>
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {correctAnswerText}
            </div>
          </div>
        )}

        {/* 题目解析 */}
        {explanation && (
          <div className="rounded-xl border border-blue-500/40 bg-blue-50 p-4">
            <div className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>题目解析</span>
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {explanation}
            </div>
          </div>
        )}

        {/* AI 分析 */}
        {analysis && (
          <div className="rounded-xl border border-orange-500/40 bg-orange-50 p-4">
            <div className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span>分析</span>
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {analysis}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useMemo } from "react";

interface QuestionHeaderProps {
  /** 题目数据 */
  question: Question;
  /** 答题状态：0-未答，1-正确，2-错误 */
  status?: number;
}

/**
 * 获取题目类型的显示文本
 */
function getQuestionTypeLabel(question: Question): string {
  const interactionType = question.question_type?.interaction_type;
  switch (interactionType) {
    case "single_choice":
      return "单选题";
    case "multi_choice":
      return "多选题";
    case "image_choice":
      return "图片选择题";
    case "true_false":
    case "correct_wrong":
      return "判断题";
    case "text_input":
    case "fill_blank":
      return "填空题";
    case "voice_input":
    case "free_speak":
    case "follow_read":
      return "口语题";
    case "drag_drop":
      return "拖拽题";
    case "connect_line":
      return "连线题";
    case "sort_order":
      return "排序题";
    default:
      return question.question_type?.name || "题目";
  }
}

/**
 * 根据状态映射获取结果徽章的 className
 */
function getResultBadgeClassName(params: { isCorrect: boolean }): string {
  const base = "w-7 h-7 rounded-full flex items-center justify-center border shadow-sm transition-all";

  if (params.isCorrect) {
    return `${base} bg-green-50 border-green-200 text-green-600`;
  }
  return `${base} bg-red-50 border-red-200 text-red-600`;
}

export function QuestionHeader({ question, status }: QuestionHeaderProps) {
  const typeLabel = useMemo(() => getQuestionTypeLabel(question), [question]);
  const knowledgePoints = useMemo(() => {
    const kp = question.knowledge_points;
    if (!kp || !Array.isArray(kp)) return [];
    return kp.map((p: any) => (typeof p === "string" ? p : p.name || String(p)));
  }, [question.knowledge_points]);

  const resultBadge = useMemo(() => {
    if (status === 0 || status === undefined) return null;
    const isCorrect = status === 1;

    return (
      <div className={getResultBadgeClassName({ isCorrect })}>
        {isCorrect ? <Check className="w-4 h-4 stroke-[2]" /> : <X className="w-4 h-4 stroke-[2]" />}
      </div>
    );
  }, [status]);

  return (
    <div className="flex items-center justify-between mb-5">
      {/* 左侧：题目类型 + 知识点 */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-600 border-none px-3 py-1 text-xs font-semibold rounded-md"
        >
          {typeLabel}
        </Badge>

        {knowledgePoints.map((kp, idx) => (
          <Badge
            key={idx}
            variant="outline"
            className="text-primary/70 border-primary/10 bg-primary/5 px-3 py-1 text-xs font-semibold rounded-md"
          >
            {kp}
          </Badge>
        ))}
      </div>

      {/* 右侧：结果反馈 */}
      {resultBadge}
    </div>
  );
}

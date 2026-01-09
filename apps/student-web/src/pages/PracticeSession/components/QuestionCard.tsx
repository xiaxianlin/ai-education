/**
 * 题目卡片组件 - 组合题目头部、内容、资源
 */

import AudioPlayer from "@/components/biz/AudioPlayer";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import { getResourceUrl } from "@ai-education/shared-web";
import { useMemo } from "react";
import { usePracticeSessionModel } from "../models/page";

export function QuestionCard() {
  const { question, answer } = usePracticeSessionModel();
  const resourceUrl = question?.resources && question.resources.length > 0 ? getResourceUrl(question.resources[0].url) : undefined;

  const resultBadge = useMemo(() => {
    if (answer?.status === 0) return null;
    const isCorrect = answer?.status === 1;
    return (
      <div
        className={cn(
          "absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl z-10",
          isCorrect
            ? "bg-gradient-to-br from-yellow-300 via-green-400 to-emerald-500"
            : "bg-gradient-to-br from-pink-400 via-orange-400 to-amber-400"
        )}
      >
        {/* 内容 */}
        <div className="relative flex items-center justify-center">
          {isCorrect ? (
            <>
              {/* 正确答案 - 大大的笑脸和星星 */}
              <div className="relative">
                <div className="text-3xl font-bold">😊</div>
                {/* 闪耀的星星 */}
                <div className="absolute -top-1 -right-1 text-yellow-300 text-lg">✨</div>
                <div className="absolute -bottom-1 -left-1 text-yellow-300 text-lg">⭐</div>
              </div>
            </>
          ) : (
            <>
              {/* 错误答案 - 鼓励的表情 */}
              <div className="relative">
                <div className="text-3xl font-bold">💪</div>
                {/* 小爱心表示鼓励 */}
                <div className="absolute -top-1 -right-1 text-pink-300 text-sm">💖</div>
              </div>
            </>
          )}
        </div>

        {/* 装饰性边框 */}
        <div
          className={cn("absolute inset-0 rounded-full border-4", isCorrect ? "border-white/50" : "border-white/40")}
        />
      </div>
    );
  }, [answer]);

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 border-blue-200">{question?.question_type_code}</Badge>
        <Badge className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 border-purple-200">
          {question?.difficulty}
        </Badge>
        {question?.knowledge_points && question.knowledge_points.length > 0 && (
          <Badge className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 border-amber-200">
            {question.knowledge_points.join(", ")}
          </Badge>
        )}
      </div>
      <div className={cn("text-lg leading-relaxed whitespace-pre-wrap text-foreground font-medium")}>
        {question?.stem.rich_text ? (
          <div dangerouslySetInnerHTML={{ __html: question.stem.rich_text }} />
        ) : (
          question?.stem.text
        )}
      </div>
      {question?.resources && question.resources.some(r => r.type === "image") && (
        <div className="flex justify-start">
          <img
            src={resourceUrl || ""}
            alt="题目图片"
            className="max-w-full h-auto max-h-[150px] object-contain rounded-xl shadow-lg border-2 border-border"
          />
        </div>
      )}
      {question?.resources && question.resources.some(r => r.type === "audio") && (
        <div className="flex justify-start">
          <AudioPlayer key={resourceUrl} src={resourceUrl || ""} />
        </div>
      )}
      {resultBadge}
    </div>
  );
}

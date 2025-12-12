/**
 * 题目卡片组件 - 组合题目头部、内容、资源
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { getResourceUrl } from "@/lib/resource";
import AudioPlayer from "@/components/business/AudioPlayer";
import { usePageModel } from "../models/PageModel";

export function QuestionCard() {
  const { question, answer } = usePageModel();
  const resourceUrl = getResourceUrl(question.resource);

  const resultBadge = useMemo(() => {
    if (answer.status === 0) return null;
    return (
      <Badge variant={answer.status === 1 ? "default" : "destructive"} className="text-sm">
        {answer.status === 1 ? "✓ 正确" : "✗ 错误"}
      </Badge>
    );
  }, [answer]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {question.type}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {question.difficulty}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {question.knowledge}
        </Badge>
      </div>
      <div className={cn("text-lg leading-relaxed whitespace-pre-wrap")}>{question.content}</div>
      {question.resource_type === "image" && (
        <div className="flex justify-start mt-4">
          <img
            src={resourceUrl || ""}
            alt="题目图片"
            className="w-[120px] h-[120px] object-cover rounded-lg shadow-md border border-border"
          />
        </div>
      )}
      {question.resource_type === "audio" && (
        <div className="flex justify-start mt-4">
          <AudioPlayer key={resourceUrl} src={resourceUrl || ""} />
        </div>
      )}
      {resultBadge}
    </div>
  );
}

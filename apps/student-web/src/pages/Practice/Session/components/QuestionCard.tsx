/**
 * 题目卡片组件 - 组合题目头部、内容、资源
 */

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { getResourceUrl } from "@/lib/resource";
import AudioPlayer from "@/components/business/AudioPlayer";
import { usePageModel } from "../models/PageModel";
import { CheckCircle2, XCircle } from "lucide-react";

export function QuestionCard() {
  const { question, answer } = usePageModel();
  const resourceUrl = getResourceUrl(question.resource);

  const resultBadge = useMemo(() => {
    if (answer.status === 0) return null;
    const isCorrect = answer.status === 1;
    return (
      <div
        className={cn(
          "absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 z-10",
          isCorrect
            ? "bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 hover:scale-110 hover:shadow-green-500/60 hover:rotate-12"
            : "bg-gradient-to-r from-orange-400 via-red-400 to-rose-500 hover:scale-110 hover:shadow-red-500/60 hover:rotate-12",
        )}
      >
        {isCorrect ? (
          <div className="relative flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-white animate-in zoom-in duration-300" />
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
          </div>
        ) : (
          <XCircle className="h-6 w-6 text-white animate-in zoom-in duration-300" />
        )}
      </div>
    );
  }, [answer]);

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
          {question.type}
        </Badge>
        <Badge className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
          {question.difficulty}
        </Badge>
        <Badge className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
          {question.knowledge}
        </Badge>
      </div>
      <div className={cn("text-lg leading-relaxed whitespace-pre-wrap text-foreground font-medium")}>
        {question.content}
      </div>
      {question.resource_type === "image" && (
        <div className="flex justify-start">
          <img
            src={resourceUrl || ""}
            alt="题目图片"
            className="max-w-full h-auto max-h-[300px] object-contain rounded-xl shadow-lg border-2 border-border"
          />
        </div>
      )}
      {question.resource_type === "audio" && (
        <div className="flex justify-start">
          <AudioPlayer key={resourceUrl} src={resourceUrl || ""} />
        </div>
      )}
      {resultBadge}
    </div>
  );
}

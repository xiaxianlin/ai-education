import { memo } from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getResourceUrl } from "@/lib/resource";
import AudioPlayer from "@/components/biz/AudioPlayer";
import { StampAnimation } from "./StampAnimation";
import type { Question } from "@/services/practice";

interface QuestionCardProps {
  question: Question;
  index: number;
  // answerStatus: 0-未答, 1-正确, 2-错误
  answerStatus?: number;
}

function QuestionCardComponent({
  question,
  index,
  answerStatus,
}: QuestionCardProps) {
  // status: 0-未答, 1-正确, 2-错误
  const hasAnswered = answerStatus !== undefined && answerStatus !== 0;
  const isCorrect = answerStatus === 1;
  return (
    <Card className="border-2 border-border shadow-sm relative overflow-visible min-h-[200px]">
      <CardContent className="pt-6 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg mb-4 text-muted-foreground">
            第 {index + 1} 题
          </CardTitle>
          <div className="flex items-center gap-2">
            {question.knowledge && (
              <span className="text-sm text-muted-foreground">
                {question.knowledge}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {question.type}
            </span>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              {question.difficulty}
            </span>
          </div>
        </div>

        <CardDescription className="text-lg font-medium text-foreground leading-relaxed whitespace-pre-wrap">
          {question.content}
        </CardDescription>

        {question.resource && question.resource_type === "image" && (
          <div className="flex justify-start">
            <img
              src={getResourceUrl(question.resource) || ""}
              alt="题目图片"
              className="w-[120px] h-[120px] object-cover rounded-lg shadow-md border border-border"
            />
          </div>
        )}

        {question.resource && question.resource_type === "audio" && (
          <div className="flex justify-start">
            <AudioPlayer
              key={question.resource}
              src={getResourceUrl(question.resource) || ""}
            />
          </div>
        )}
      </CardContent>
      <StampAnimation isCorrect={isCorrect === true} show={hasAnswered} />
    </Card>
  );
}

export const QuestionCard = memo(QuestionCardComponent);

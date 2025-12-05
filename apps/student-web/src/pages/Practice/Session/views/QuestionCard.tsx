/**
 * 题目卡片组件 - 组合题目头部、内容、资源
 */
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QuestionHeader } from "../components/question/QuestionHeader";
import { QuestionContent } from "../components/question/QuestionContent";
import { QuestionResource } from "../components/question/QuestionResource";
import { StampAnimation } from "./StampAnimation";

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
  const hasAnswered = answerStatus !== undefined && answerStatus !== 0;
  const isCorrect = answerStatus === 1;

  return (
    <Card className="border-2 border-border shadow-sm relative overflow-visible min-h-[200px]">
      <CardContent className="pt-6 pb-6 space-y-6">
        <QuestionHeader
          index={index}
          type={question.type}
          difficulty={question.difficulty}
          knowledge={question.knowledge}
          answerStatus={answerStatus}
        />

        <div className="pl-11">
          <QuestionContent
            content={question.content}
            answerStatus={answerStatus}
          />

          <QuestionResource
            resource={question.resource}
            resourceType={question.resource_type}
          />
        </div>
      </CardContent>
      <StampAnimation isCorrect={isCorrect === true} show={hasAnswered} />
    </Card>
  );
}

export const QuestionCard = memo(QuestionCardComponent);

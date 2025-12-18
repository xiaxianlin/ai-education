/**
 * 答题卡片组件
 * - 根据题型渲染不同输入组件
 */
import { Card, CardContent } from "@/components/card";
import { ChoiceInput } from "./AnswerForm/ChoiceInput";
import { JudgeInput } from "./AnswerForm/JudgeInput";
import { TextInput } from "./AnswerForm/TextInput";
import { AudioInput } from "./AnswerForm/AudioInput";
import { usePageModel } from "../models/PageModel";
import { QuestionType } from "../types";
import { useMemo, useRef } from "react";
import { Button } from "@/components/button";
import { Loader2 } from "lucide-react";

export function AnswerCard() {
  const { question, answer, answers, order, submitting, isComplete, setAnswer, handleSubmit } = usePageModel();

  const startTime = useRef(Date.now());
  const orderAnswer = answers[order];

  const answerFormItem = useMemo(() => {
    const disabled = submitting || isComplete || orderAnswer?.status !== 0;
    const props = {
      value: answer,
      disabled,
      onChange: setAnswer,
    };
    switch (question?.type) {
      case QuestionType.AUDIO:
        return <AudioInput {...props} />;
      case QuestionType.CHOICE:
        return <ChoiceInput {...props} />;
      case QuestionType.JUDGE:
        return <JudgeInput {...props} />;
      case QuestionType.TEXT:
        return <TextInput {...props} />;
      default:
        return null;
    }
  }, [question, answer, submitting, setAnswer]);

  return (
    <>
      <Card className="border-2 border-primary/20 shadow-lg rounded-2xl bg-card">
        <CardContent className="p-6 space-y-5">{answerFormItem}</CardContent>
      </Card>
      {!isComplete && (
        <div className="pb-4">
          <Button
            type="button"
            disabled={answer?.status !== 0 || submitting}
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            onClick={() => handleSubmit(Math.ceil((Date.now() - startTime.current) / 1000))}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                提交中...
              </>
            ) : (
              "提交答案"
            )}
          </Button>
        </div>
      )}
    </>
  );
}

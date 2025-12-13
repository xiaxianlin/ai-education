/**
 * 答题卡片组件
 * - 根据题型渲染不同输入组件
 */
import { Card, CardContent } from "@/components/ui/card";
import { ChoiceInput } from "./AnswerForm/ChoiceInput";
import { JudgeInput } from "./AnswerForm/JudgeInput";
import { TextInput } from "./AnswerForm/TextInput";
import { AudioInput } from "./AnswerForm/AudioInput";
import { usePageModel } from "../models/PageModel";
import { QuestionType } from "../types";
import { useMemo } from "react";

export function AnswerCard() {
  const { question, answerRecord, submitting, setAnswerRecord } = usePageModel();

  const answerFormItem = useMemo(() => {
    const disabled = submitting || !!answerRecord;
    const props = {
      value: answerRecord,
      disabled,
      onChange: setAnswerRecord,
    };
    switch (question.type) {
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
  }, []);

  return (
    <>
      <Card className="border-2 border-primary/20 shadow-lg rounded-2xl bg-card">
        <CardContent className="p-6 space-y-5">{answerFormItem}</CardContent>
      </Card>
    </>
  );
}

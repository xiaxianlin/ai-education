/**
 * 答题卡片组件
 * - 根据题型渲染不同输入组件
 * - 支持复合题
 */
import { Button, Card, CardContent } from "@/components/ui";
import { isCompositeQuestion } from "@ai-education/shared-web";
import { Loader2 } from "lucide-react";
import { useMemo, useRef } from "react";
import { usePracticeSessionModel } from "../models/page";
import { AudioInput } from "./AnswerForm/AudioInput";
import { ChoiceInput } from "./AnswerForm/ChoiceInput";
import { JudgeInput } from "./AnswerForm/JudgeInput";
import { TextInput } from "./AnswerForm/TextInput";

/** 根据交互类型获取输入组件 */
function getInputComponent(interactionType: string) {
  if (interactionType === "voice_input" || interactionType === "free_speak") {
    return AudioInput;
  }
  if (interactionType === "single_choice" || interactionType === "multi_choice") {
    return ChoiceInput;
  }
  if (interactionType === "true_false" || interactionType === "correct_wrong") {
    return JudgeInput;
  }
  if (interactionType === "text_input" || interactionType === "fill_blank") {
    return TextInput;
  }
  return null;
}

/** 子题渲染组件 */
function SubQuestionItem({
  subQuestion,
  index,
  value,
  disabled,
  onChange,
}: {
  subQuestion: any;
  index: number;
  value: string;
  disabled: boolean;
  onChange: (val: string) => void;
}) {
  const InputComponent = getInputComponent(subQuestion.interactionType);

  return (
    <div className="relative p-5 bg-secondary/20 rounded-2xl border border-border/30">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>
        <div className="pt-1 text-base font-medium leading-relaxed">{subQuestion.stem?.text}</div>
      </div>

      <div className="pl-11">
        {InputComponent ? (
          <InputComponent value={value} disabled={disabled} onChange={onChange} />
        ) : (
          <div className="text-sm text-muted-foreground italic">不支持的题型: {subQuestion.interactionType}</div>
        )}
      </div>
    </div>
  );
}

export function AnswerCard() {
  const { question, answer, answers, order, submitting, isComplete, setAnswer, handleSubmit } =
    usePracticeSessionModel();

  const startTime = useRef(Date.now());
  const orderAnswer = answers[order];

  // 判断是否为复合题
  const isComposite = question ? isCompositeQuestion(question) : false;

  // 复合题答案状态 (Record<subQuestionId, answerValue>)
  const compositeAnswers = useMemo(() => {
    if (!isComposite || !answer?.text_answer) return {};
    try {
      return JSON.parse(answer.text_answer);
    } catch {
      return {};
    }
  }, [isComposite, answer?.text_answer]);

  // 更新复合题的子题答案
  const handleSubAnswerChange = (subQuestionId: string, value: string) => {
    const newAnswers = { ...compositeAnswers, [subQuestionId]: value };
    setAnswer({
      ...answer,
      text_answer: JSON.stringify(newAnswers),
    } as PracticeAnswer);
  };

  const answerFormItem = useMemo(() => {
    if (!question) {
      return <div className="text-muted-foreground">题目加载中...</div>;
    }

    const disabled = submitting || isComplete || orderAnswer?.status !== 0;

    // 复合题渲染
    if (isComposite) {
      const subQuestions = question.stem?.subQuestions || [];
      return (
        <div className="space-y-4">
          {subQuestions.map((subQ: any, idx: number) => (
            <SubQuestionItem
              key={subQ.id}
              subQuestion={subQ}
              index={idx}
              value={compositeAnswers[subQ.id] || ""}
              disabled={disabled}
              onChange={(val) => handleSubAnswerChange(subQ.id, val)}
            />
          ))}
        </div>
      );
    }

    // 单题渲染
    const props = {
      value: answer,
      disabled,
      onChange: setAnswer,
    };

    const interactionType = question?.question_type?.interaction_type;
    const InputComponent = getInputComponent(interactionType);

    if (InputComponent) {
      return <InputComponent {...props} />;
    }

    console.warn("[AnswerCard] Unknown interaction type:", interactionType, "Question:", question);
    return <div className="text-muted-foreground">暂不支持此题型</div>;
  }, [question, answer, submitting, setAnswer, orderAnswer, isComplete, isComposite, compositeAnswers]);

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

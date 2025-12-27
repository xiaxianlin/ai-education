import { AnswerStateManager, useAnswerState } from "@/components/question-v2/AnswerStateManager";
import { FeedbackAnimation } from "@/components/question-v2/FeedbackAnimation";
import { QuestionRenderer } from "@/components/question-v2/QuestionRenderer";
import { SoundEffects } from "@/components/question-v2/SoundEffects";
import { Button } from "@/components/ui";
import { studentApi } from "@/lib/api";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { usePageModel } from "../models/page";

/**
 * 答题步骤主视图
 */
export function ProcessingView() {
  const { question, session, next } = usePageModel();
  const [v2Question, setV2Question] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"correct" | "incorrect" | "partial" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 加载 V2 题目详情
  useEffect(() => {
    const loadV2Question = async () => {
      if (!question?.id) return;
      setLoading(true);
      try {
        const data = await studentApi.getQuestion(question.id);
        setV2Question(data);
        setFeedbackStatus(null); // 切换题目重置反馈
      } catch (err) {
        console.error("Failed to load V2 question:", err);
      } finally {
        setLoading(false);
      }
    };
    loadV2Question();
  }, [question?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div className="text-muted-foreground font-medium">正在准备精彩题目...</div>
      </div>
    );
  }

  if (!v2Question) return null;

  return (
    <div className="p-4 md:p-8 bg-pattern min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto space-y-8">
        <ProgressIndicator />

        <AnswerStateManager initialValue={null} type={v2Question.interactionType}>
          <div className="bg-card rounded-[3rem] shadow-2xl shadow-primary/5 border-2 border-primary/5 overflow-hidden">
            <div className="p-8 md:p-12">
              <QuestionRenderer question={v2Question} showFeedback={!!feedbackStatus} />
            </div>
          </div>

          <SubmitControl
            onCheck={async (answer) => {
              setSubmitting(true);
              try {
                const result = await studentApi.submitPracticeAnswer({
                  session_id: session?.id,
                  question_id: v2Question.id,
                  answer: answer,
                  time_spent: 0,
                });
                const status = result.is_correct ? "correct" : "incorrect";
                setFeedbackStatus(status);
                SoundEffects.play(status);
                if (result.is_correct) {
                  // 如果正确，延迟进入下一题
                  setTimeout(() => {
                    next();
                  }, 2000);
                }
              } catch (e) {
                toast.error("提交出错了，请稍后再试");
              } finally {
                setSubmitting(false);
              }
            }}
            submitting={submitting}
            showNext={feedbackStatus === "correct"}
          />
        </AnswerStateManager>

        <FeedbackAnimation status={feedbackStatus} onComplete={() => setFeedbackStatus(null)} />
      </div>
    </div>
  );
}

/** 提交控制按钮组 */
function SubmitControl({
  onCheck,
  submitting,
  showNext,
}: {
  onCheck: (val: any) => void;
  submitting: boolean;
  showNext: boolean;
}) {
  const { currentAnswer, isValid } = useAnswerState();

  return (
    <div className="flex justify-center items-center py-6 animate-in fade-in slide-in-from-bottom-2">
      {!showNext ? (
        <Button
          size="lg"
          disabled={!isValid || submitting}
          className="h-16 px-16 text-xl font-bold rounded-2xl shadow-xl hover:shadow-primary/20 transition-all button-3d"
          onClick={() => onCheck(currentAnswer)}
        >
          {submitting ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
          检查答案
        </Button>
      ) : (
        <div className="flex items-center gap-4 text-primary font-bold animate-bounce text-xl">
          <CheckCircle2 className="w-8 h-8" />
          <span>正在进入下一题...</span>
        </div>
      )}
    </div>
  );
}

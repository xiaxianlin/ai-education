/**
 * 答题卡片组件
 * - 根据题型渲染不同输入组件
 * - 与 PageModel 的草稿答案（draft）同步
 */
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChoiceInput } from "./AnswerForm/ChoiceInput";
import { JudgeInput } from "./AnswerForm/JudgeInput";
import { TextInput } from "./AnswerForm/TextInput";
import { AudioInput } from "./AnswerForm/AudioInput";
import { usePageModel } from "../models/PageModel";

function isChoiceQuestion(question?: Question) {
  if (!question) return false;
  if (question.type === "选择题") return true;
  return !!question.options;
}

function isJudgeQuestion(question?: Question) {
  if (!question) return false;
  return question.type === "判断题";
}

function isSpellingQuestion(question?: Question) {
  if (!question) return false;
  return question.type === "拼写题";
}

function isOralQuestion(question?: Question) {
  if (!question) return false;
  return question.type === "口语题";
}

export function AnswerCard() {
  const {
    question,
    answer,
    currentDraft,
    setCurrentDraftValue,
    setCurrentDraftAudio,
    submitting,
  } = usePageModel();

  if (!question || !answer) return null;

  const hasAnswered = (answer.status || 0) !== 0;
  const isCorrect = (answer.status || 0) === 1;

  const inputValue = hasAnswered ? (answer.text_answer || "") : (currentDraft?.value || "");
  const audioValue = hasAnswered ? (answer.audio_answer || "") : currentDraft?.audio?.uploaded ? "uploaded" : "";

  const renderInput = () => {
    if (isOralQuestion(question)) {
      return (
        <AudioInput
          value={audioValue}
          disabled={submitting}
          hasAnswered={hasAnswered}
          onChange={(answerText, analysis) => {
            setCurrentDraftAudio(
              {
                uploaded: true,
                match: analysis.match,
                analysis: analysis.analysis,
              },
              answerText,
            );
          }}
        />
      );
    }

    if (isChoiceQuestion(question)) {
      return (
        <ChoiceInput
          question={question}
          value={inputValue}
          disabled={submitting}
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
          onChange={(v) => setCurrentDraftValue(v)}
        />
      );
    }

    if (isJudgeQuestion(question)) {
      return (
        <JudgeInput
          value={inputValue}
          disabled={submitting}
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
          onChange={(v) => setCurrentDraftValue(v)}
        />
      );
    }

    return (
      <TextInput
        value={inputValue}
        disabled={submitting}
        hasAnswered={hasAnswered}
        isCorrect={isCorrect}
        isSpelling={isSpellingQuestion(question)}
        onChange={(v) => setCurrentDraftValue(v)}
      />
    );
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg rounded-2xl bg-card">
      <CardContent className="p-6 space-y-5">
        {renderInput()}

        {/* 口语题：在提交前展示分析结果，帮助学生确认 */}
        {!hasAnswered && isOralQuestion(question) && currentDraft?.audio?.analysis && (
          <div
            className={cn(
              "rounded-xl border p-4 text-sm leading-relaxed",
              currentDraft.audio.match
                ? "border-green-500/40 bg-green-50 dark:bg-green-950/20"
                : "border-amber-500/40 bg-amber-50 dark:bg-amber-950/20",
            )}
          >
            <div className="font-semibold mb-2">
              {currentDraft.audio.match ? "✓ 口语匹配" : "⚠️ 口语可能不匹配"}
            </div>
            <div className="whitespace-pre-wrap text-foreground">{currentDraft.audio.analysis}</div>
          </div>
        )}

        {/* 非口语题：答错时展示正确答案 */}
        {hasAnswered && !isOralQuestion(question) && !isCorrect && (question.answer || "") && (
          <div className="rounded-xl border border-green-500/40 bg-green-50 dark:bg-green-950/20 p-4">
            <div className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">正确答案</div>
            <div className="text-sm text-foreground whitespace-pre-wrap">{question.answer}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

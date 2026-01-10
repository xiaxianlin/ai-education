import type { InteractionType } from "@ai-education/shared-web";
import { isCompositeQuestion } from "@ai-education/shared-web";
import { useAnswerState } from "./AnswerStateManager";
import { QuestionStem } from "./QuestionStem";
import { getInteractionInput } from "./inputs";

interface QuestionRendererProps {
  question: any;
  showFeedback?: boolean;
}

/**
 * 根据状态映射获取答题交互区的 className
 */
function getInteractionAreaClassName(params: {
  showFeedback: boolean;
}): string {
  const base = "transition-all duration-500";
  const classes: string[] = [base];
  
  if (params.showFeedback) {
    classes.push("opacity-80 pointer-events-none");
  }
  
  return classes.join(" ");
}

/**
 * V2 题目渲染器
 * 集成 AnswerStateManager 的状态管理
 */
export function QuestionRenderer({ question, showFeedback }: QuestionRendererProps) {
  const { currentAnswer, setAnswer } = useAnswerState();
  const isComposite = isCompositeQuestion(question);

  // 获取主交互组件 (仅单题)
  const InteractionInput = !isComposite ? getInteractionInput(question.interactionType as InteractionType) : null;

  return (
    <div className="space-y-8">
      {/* 题干部分 */}
      <QuestionStem stem={question.stem} resources={question.resources} className="mb-8" />

      {/* 答题交互区 */}
      <div className={getInteractionAreaClassName({
        showFeedback,
      })}>
        {isComposite ? (
          // 复合题渲染
          <div className="space-y-12">
            {question.stem.sub_questions?.map((subQ: any, idx: number) => (
              <SubQuestionItem
                key={subQ.id}
                subQuestion={subQ}
                index={idx}
                value={currentAnswer?.[subQ.id]}
                disabled={showFeedback}
                onChange={(val: any) => {
                  const newAnswers = { ...(currentAnswer || {}), [subQ.id]: val };
                  setAnswer(newAnswers);
                }}
              />
            ))}
          </div>
        ) : (
          // 单题渲染
          <div className="bg-background/50 rounded-3xl p-6 border-2 border-border/50">
            {InteractionInput ? (
              <InteractionInput
                value={currentAnswer || ""}
                options={question.options}
                disabled={showFeedback}
                onChange={setAnswer}
              />
            ) : (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                未定义的交互类型: {question.interactionType}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 题目解析 (答题后显示) */}
      {showFeedback && question.explanation && (
        <div className="animate-in slide-in-from-bottom-4 duration-500 mt-12 p-6 bg-primary/5 border-2 border-primary/20 rounded-[2rem]">
          <h4 className="flex items-center gap-2 text-primary font-bold mb-3">
            <span className="text-xl">📖</span>
            题目解析
          </h4>
          <p className="text-foreground/80 leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

/** 子题渲染项 */
function SubQuestionItem({ subQuestion, index, value, disabled, onChange }: any) {
  const Input = getInteractionInput(subQuestion.interactionType as InteractionType);

  return (
    <div className="relative p-6 bg-background/40 rounded-3xl border-2 border-border/30 hover:border-primary/20 transition-colors">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
          {index + 1}
        </div>
        <div className="pt-1 text-lg font-medium leading-relaxed">{subQuestion.stem?.text}</div>
      </div>

      <div className="pl-14">
        {Input ? (
          <Input value={value || ""} options={subQuestion.options} disabled={disabled} onChange={onChange} />
        ) : (
          <div className="text-sm text-muted-foreground italic">不支持的题型: {subQuestion.interactionType}</div>
        )}
      </div>
    </div>
  );
}

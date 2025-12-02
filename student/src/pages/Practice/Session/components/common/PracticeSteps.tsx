import { FC } from "react";
import clsx from "clsx";

interface PracticeStepsProps {
  /** 当前步骤：1=准备开始，2=做题中，3=看结果 */
  current: 1 | 2 | 3;
}

const steps = [
  { id: 1, label: "准备开始" },
  { id: 2, label: "做题中" },
  { id: 3, label: "看结果" },
];

export const PracticeSteps: FC<PracticeStepsProps> = ({ current }) => {
  return (
    <div className="flex items-center justify-center gap-2 text-xs md:text-sm">
      {steps.map((step, index) => {
        const isActive = step.id === current;
        const isDone = step.id < current;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={clsx(
                "flex items-center gap-1 px-2.5 py-1 rounded-full border bg-white/90 backdrop-blur",
                isActive && "border-primary text-primary font-semibold shadow-sm",
                isDone && "border-emerald-400 bg-emerald-50 text-emerald-700",
                !isActive && !isDone && "border-muted text-muted-foreground"
              )}
            >
              <span className="w-4 text-center">{step.id}</span>
              <span>{step.label}</span>
            </div>
            {!isLast && (
              <span className="mx-1 text-[10px] text-muted-foreground">➜</span>
            )}
          </div>
        );
      })}
      <span className="ml-2 hidden md:inline text-[11px] text-muted-foreground">
        现在在第 {current} 步
      </span>
    </div>
  );
};



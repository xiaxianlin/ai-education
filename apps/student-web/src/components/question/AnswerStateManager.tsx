import React, { createContext, useContext, useMemo } from "react";
import { useAnswerHistory } from "./hooks/useAnswerHistory";
import { useAnswerTimer } from "./hooks/useAnswerTimer";
import { useAnswerValidation } from "./hooks/useAnswerValidation";

interface AnswerStateContextValue {
  seconds: number;
  currentAnswer: any;
  isValid: boolean;
  message: string;
  history: any;
  setAnswer: (value: any) => void;
  undo: () => void;
  resetTimer: () => void;
}

const AnswerStateContext = createContext<AnswerStateContextValue | null>(null);

export function useAnswerState() {
  const context = useContext(AnswerStateContext);
  if (!context) throw new Error("useAnswerState must be used within AnswerStateManager");
  return context;
}

interface AnswerStateManagerProps {
  initialValue: any;
  type: any;
  children: React.ReactNode;
  onAnswerChange?: (value: any) => void;
}

/**
 * 答题状态管理器
 * 统一管理计时、历史、验证等逻辑
 */
export function AnswerStateManager({ initialValue, type, children, onAnswerChange }: AnswerStateManagerProps) {
  const { seconds, reset: resetTimer } = useAnswerTimer(true);
  const { validate } = useAnswerValidation();
  const history = useAnswerHistory(initialValue);

  const setAnswer = (newValue: any) => {
    history.push(newValue);
    onAnswerChange?.(newValue);
  };

  const validationResult = useMemo(() => {
    return validate(type, history.current);
  }, [type, history.current, validate]);

  const contextValue = useMemo(
    () => ({
      seconds,
      currentAnswer: history.current,
      isValid: validationResult.isValid,
      message: validationResult.message,
      history,
      setAnswer,
      undo: history.undo,
      resetTimer,
    }),
    [seconds, history, validationResult, resetTimer]
  );

  return <AnswerStateContext.Provider value={contextValue}>{children}</AnswerStateContext.Provider>;
}

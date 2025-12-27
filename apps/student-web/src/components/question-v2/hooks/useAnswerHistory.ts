import { useCallback, useState } from "react";

/**
 * 答题历史管理 Hook (支持撤销/重做)
 */
export function useAnswerHistory<T>(initialState: T, maxHistory: number = 20) {
  const [current, setCurrent] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [index, setIndex] = useState(0);

  const push = useCallback(
    (newState: T) => {
      const newHistory = history.slice(0, index + 1);
      newHistory.push(newState);

      // 限制历史记录数量
      if (newHistory.length > maxHistory) {
        newHistory.shift();
      } else {
        setIndex(newHistory.length - 1);
      }

      setHistory(newHistory);
      setCurrent(newState);
    },
    [history, index, maxHistory]
  );

  const undo = useCallback(() => {
    if (index > 0) {
      const newIndex = index - 1;
      setIndex(newIndex);
      setCurrent(history[newIndex]);
      return history[newIndex];
    }
    return null;
  }, [history, index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) {
      const newIndex = index + 1;
      setIndex(newIndex);
      setCurrent(history[newIndex]);
      return history[newIndex];
    }
    return null;
  }, [history, index]);

  const reset = useCallback((state: T) => {
    setCurrent(state);
    setHistory([state]);
    setIndex(0);
  }, []);

  return {
    current,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
    push,
    undo,
    redo,
    reset,
  };
}

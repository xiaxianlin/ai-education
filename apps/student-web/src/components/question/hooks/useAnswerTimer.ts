import { useEffect, useRef, useState } from "react";

/**
 * 答题计时 Hook
 */
export function useAnswerTimer(isActive: boolean = true) {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const reset = () => setSeconds(0);

  return { seconds, reset };
}

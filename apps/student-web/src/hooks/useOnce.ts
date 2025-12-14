import { useEffect, useRef } from "react";

export const useOnce = (fn: () => void, options: { ready: boolean }) => {
  const flag = useRef(false);
  useEffect(() => {
    if (!options?.ready) return;
    if (!flag.current) {
      fn();
      flag.current = true;
    }
  }, [options?.ready]);
};

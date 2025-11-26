/**
 * 防抖搜索 Hook
 * 基于 ahooks 的 useDebounce 和 useDebounceEffect
 */
import { useState } from "react";
import { useDebounce, useDebounceEffect } from "ahooks";

export function useDebounceSearch<TResult = any>(
  searchFn: (keyword: string) => Promise<TResult>,
  options?: {
    wait?: number;
    leading?: boolean;
    trailing?: boolean;
  }
) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<TResult | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedKeyword = useDebounce(keyword, {
    wait: options?.wait || 500,
    leading: options?.leading,
    trailing: options?.trailing,
  });

  useDebounceEffect(
    () => {
      if (debouncedKeyword) {
        setLoading(true);
        searchFn(debouncedKeyword)
          .then((data) => {
            setResults(data);
          })
          .catch((error) => {
            console.error("Search failed:", error);
            setResults(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setResults(null);
      }
    },
    [debouncedKeyword],
    { wait: options?.wait || 500 }
  );

  return {
    keyword,
    setKeyword,
    results,
    loading,
    debouncedKeyword,
  };
}

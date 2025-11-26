/**
 * LocalStorage Hook
 * 基于 ahooks 的 useLocalStorageState
 */
import { useLocalStorageState } from "ahooks";

export function useLocalStorage<T = any>(
  key: string,
  options?: {
    defaultValue?: T;
    serializer?: (value: T) => string;
    deserializer?: (value: string) => T;
  }
) {
  return useLocalStorageState<T>(key, options);
}

/**
 * Toggle Hook
 * 基于 ahooks 的 useBoolean 和 useToggle
 */
import { useBoolean, useToggle as useAhooksToggle } from "ahooks";

export function useToggle(defaultValue?: boolean) {
  return useBoolean(defaultValue);
}

export function useToggleState<T = boolean>(
  defaultValue: T,
  reverseValue: T
) {
  return useAhooksToggle(defaultValue, reverseValue);
}

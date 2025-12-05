/**
 * 倒计时 Hook
 * 基于 ahooks 的 useCountDown
 */
import { useCountDown } from "ahooks";

export function useCountdown(options?: {
  leftTime?: number;
  targetDate?: string | number | Date;
  interval?: number;
  onEnd?: () => void;
}) {
  const [countdown, formattedRes] = useCountDown({
    leftTime: options?.leftTime,
    targetDate: options?.targetDate,
    interval: options?.interval || 1000,
    onEnd: options?.onEnd,
  });

  return {
    countdown,
    days: formattedRes.days,
    hours: formattedRes.hours,
    minutes: formattedRes.minutes,
    seconds: formattedRes.seconds,
    milliseconds: formattedRes.milliseconds,
  };
}

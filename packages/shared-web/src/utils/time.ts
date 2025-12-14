/**
 * 时间格式化工具函数
 */

import dayjs from "dayjs";

/**
 * 格式化时间戳为日期时间字符串
 * @param timestamp Unix时间戳（秒）
 * @returns 格式化的日期时间字符串，如 "2024-01-15 14:30"
 */
export function formatDateTime(timezone?: number, fmt = "YYYY-MM-DD HH:mm"): string {
  if (!timezone) return "-";
  return dayjs(timezone * 1000).format(fmt);
}

/**
 * 格式化时间戳为日期字符串
 * @param timestamp Unix时间戳（秒）
 * @returns 格式化的日期字符串，如 "2024-01-15"
 */
export function formatDate(timezone?: number, fmt = "YYYY-MM-DD"): string {
  if (!timezone) return "-";
  return dayjs(timezone * 1000).format(fmt);
}

/**
 * 格式化相对时间（如：刚刚、5分钟前、2小时前、3天前）
 * @param timestamp Unix时间戳（秒）
 * @returns 相对时间字符串
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) {
    return "刚刚";
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes}分钟前`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours}小时前`;
  } else if (diff < 604800) {
    const days = Math.floor(diff / 86400);
    return `${days}天前`;
  } else {
    return formatDate(timestamp);
  }
}

/**
 * 格式化耗时（秒）为可读字符串
 * @param seconds 秒数
 * @returns 格式化的时间字符串，如 "5分30秒" 或 "2小时15分"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return secs > 0 ? `${hours}小时${minutes}分${secs}秒` : `${hours}小时${minutes}分钟`;
    }
    return secs > 0 ? `${hours}小时${secs}秒` : `${hours}小时`;
  }

  return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`;
}

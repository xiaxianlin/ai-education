/**
 * 练习状态配置
 */
export const PRACTICE_STATUS_CONFIG: Record<PracticeStatus, { label: string; color: string }> = {
  0: { label: '未开始', color: 'default' },
  1: { label: '进行中', color: 'processing' },
  2: { label: '已完成', color: 'success' },
  3: { label: '已废弃', color: 'error' },
};

/**
 * 练习类型配置
 */
export const PRACTICE_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  ability_practice: { label: '能力练习', color: 'blue' },
  unit_practice: { label: '单元练习', color: 'green' },
};

/**
 * 生成状态配置
 */
export const GENERATE_STATUS_CONFIG: Record<PracticeGenerateStatus, { label: string; color: string }> = {
  [-1]: { label: '生成失败', color: 'error' },
  0: { label: '生成中', color: 'processing' },
  1: { label: '已完成', color: 'success' },
};

/**
 * 格式化时长
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}分钟`;
  }
  return `${minutes}分${remainingSeconds}秒`;
}

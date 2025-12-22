export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
  system: '系统练习',
  custom: '自定义练习',
};

export const PRACTICE_STATUS_LABELS: Record<PracticeSessionStatus, string> = {
  0: '未开始',
  1: '进行中',
  2: '已完成',
};

export const PRACTICE_STATUS_COLORS: Record<PracticeSessionStatus, string> = {
  0: 'default',
  1: 'warning',
  2: 'success',
};

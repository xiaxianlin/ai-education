export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
  daily_practice: '每日练习',
  unit_practice: '单元练习',
  assessment: '能力评估',
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

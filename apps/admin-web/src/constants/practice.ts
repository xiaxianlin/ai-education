import { PracticeStatus } from '@ai-education/shared-web';

export const PRACTICE_STATUS_LABELS: Record<PracticeStatus, string> = {
  [PracticeStatus.READY]: '未开始',
  [PracticeStatus.PRACTICING]: '进行中',
  [PracticeStatus.COMPLETED]: '已完成',
  [PracticeStatus.ABANDONED]: '已废弃',
};

export const PRACTICE_STATUS_COLORS: Record<PracticeStatus, string> = {
  [PracticeStatus.READY]: 'default',
  [PracticeStatus.PRACTICING]: 'warning',
  [PracticeStatus.COMPLETED]: 'success',
  [PracticeStatus.ABANDONED]: 'error',
};

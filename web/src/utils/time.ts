import dayjs from 'dayjs';

export function fmtTime(timezone?: number) {
  if (!timezone) return '-';
  return dayjs(timezone * 1000).format('YYYY-MM-DD');
}

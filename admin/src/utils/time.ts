import dayjs from 'dayjs';

export function fmtTime(timezone?: number, fmt = 'YYYY-MM-DD HH:mm') {
  if (!timezone) return '-';
  return dayjs(timezone * 1000).format(fmt);
}

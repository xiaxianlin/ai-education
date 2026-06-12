import { Badge } from '@/components/ui';
import type { FC } from 'react';

export const StatusTag: FC<{
  status: boolean;
  trueText?: string;
  falseText?: string;
}> = ({ status, trueText = '启用', falseText = '停用' }) => {
  return status ? <Badge variant="success">{trueText}</Badge> : <Badge variant="destructive">{falseText}</Badge>;
};

import { Tag } from 'antd';
import { FC } from 'react';

export const StatusTag: FC<{
  status: boolean;
  trueText?: string;
  falseText?: string;
}> = ({ status, trueText = '启用', falseText = '停用' }) => {
  return status ? <Tag color="success">{trueText}</Tag> : <Tag>{falseText}</Tag>;
};

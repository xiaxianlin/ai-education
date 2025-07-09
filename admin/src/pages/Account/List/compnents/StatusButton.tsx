import React, { FC } from 'react';
import { useRequest } from 'ahooks';
import { Button, message, Popconfirm } from 'antd';
import { modifyAccountStatus } from '@/services/account';

export const StatusButton: FC<{ record: Account; onChange?: () => void }> = ({ record, onChange }) => {
  const title = record.status ? '禁用' : '启用';
  const description = `确定要${title}该账号？`;

  const { runAsync, loading } = useRequest(modifyAccountStatus, {
    manual: true,
    ready: !!record.id,
    onSuccess: (res) => {
      if (!res.ok) return;
      message.success(title + '成功');
      onChange?.();
    },
  });

  return (
    <Popconfirm
      okText="确定"
      title="确认提示"
      cancelText="取消"
      description={description}
      onConfirm={() => runAsync(record.id, record.status ? 0 : 1)}
    >
      <Button type="link" size="small" loading={loading} className="p-0">
        {title}
      </Button>
    </Popconfirm>
  );
};

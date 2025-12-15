import { useMemo } from 'react';
import { Button, Space, Tag } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';

type Props = {
  versions: PromptVersion[];
  onView: (version: PromptVersion) => void;
  onPublish: (vid: number) => Promise<void>;
  onArchive: (vid: number) => Promise<void>;
};

export function VersionList({ versions, onView, onPublish, onArchive }: Props) {
  const columns = useMemo<ProColumns<PromptVersion>[]>(
    () => [
      { title: '版本号', dataIndex: 'version_no' },
      {
        title: '发布',
        dataIndex: 'is_published',
        render: (_, r) => (r.is_published ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
      },
      { title: '变更说明', dataIndex: 'changelog' },
      {
        title: '操作',
        valueType: 'option',
        render: (_, record) => (
          <Space>
            <Button size="small" type="link" onClick={() => onView(record)}>
              查看
            </Button>
            <Button size="small" type="link" onClick={() => onPublish(record.id)}>
              发布
            </Button>
            <Button size="small" danger type="link" onClick={() => onArchive(record.id)}>
              下线
            </Button>
          </Space>
        ),
      },
    ],
    [onView, onPublish, onArchive],
  );

  return (
    <ProTable<PromptVersion>
      rowKey="id"
      search={false}
      options={false}
      columns={columns}
      dataSource={versions}
      pagination={false}
    />
  );
}

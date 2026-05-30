import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumn,
} from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { formatDateTime } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { Edit3, Plus, Power, PowerOff, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

import { TextbookVersionApi } from '../../api';
import { useTextbookVersionListModel } from '../models/page';

export default function TableView() {
  const {
    actionRef,
    subject,
    formProps: { showForm },
  } = useTextbookVersionListModel();

  const {
    data = [],
    loading,
    refresh,
  } = useRequest(() => TextbookVersionApi.searchTextbookVersions({ subject }), {
    refreshDeps: [subject],
  });

  const { runAsync: deleteVersion } = useRequest(TextbookVersionApi.deleteTextbookVersion, {
    manual: true,
    onSuccess: () => {
      toast.success('删除成功');
      refresh();
    },
  });

  const { runAsync: disableVersion } = useRequest(TextbookVersionApi.disableTextbookVersion, {
    manual: true,
    onSuccess: () => {
      toast.success('停用成功');
      refresh();
    },
  });

  const { runAsync: enableVersion } = useRequest(TextbookVersionApi.enableTextbookVersion, {
    manual: true,
    onSuccess: () => {
      toast.success('启用成功');
      refresh();
    },
  });

  useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  const handleDelete = (id: number) => {
    if (window.confirm('确定要删除该版本吗？删除前会检查是否被使用，使用的版本无法删除。')) {
      deleteVersion(id);
    }
  };

  const handleToggle = (record: TextbookVersion) => {
    if (record.is_enabled) {
      if (window.confirm('确定要停用该版本吗？')) {
        disableVersion(record.id);
      }
      return;
    }
    enableVersion(record.id);
  };

  const columns: DataTableColumn<TextbookVersion>[] = [
    { key: 'name', title: '版本名称' },
    { key: 'revision_year', title: '修订年份' },
    {
      key: 'is_enabled',
      title: '状态',
      render: (record) => (
        <Badge variant={record.is_enabled ? 'success' : 'secondary'}>{record.is_enabled ? '启用' : '停用'}</Badge>
      ),
    },
    {
      key: 'create_time',
      title: '创建时间',
      render: (record) => formatDateTime(record.create_time),
    },
    {
      key: 'update_time',
      title: '更新时间',
      render: (record) => formatDateTime(record.update_time),
    },
    {
      key: 'actions',
      title: '操作',
      className: 'text-right',
      render: (record) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" icon={<Edit3 className="size-4" />} onClick={() => showForm(record)}>
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={record.is_enabled ? <PowerOff className="size-4" /> : <Power className="size-4" />}
            onClick={() => handleToggle(record)}
          >
            {record.is_enabled ? '停用' : '启用'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive"
            icon={<Trash2 className="size-4" />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>版本列表</CardTitle>
          <CardDescription>{loading ? '加载中...' : `${data.length} 条记录`}</CardDescription>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => showForm()}>
          新增教材版本
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} loading={loading} rowKey="id" />
      </CardContent>
    </Card>
  );
}

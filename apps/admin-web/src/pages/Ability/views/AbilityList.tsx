import { StatusTag } from '@/components';
import {
  Card,
  CardContent,
  Button,
  DataTable,
  Rating,
  type DataTableColumn,
} from '@/components/ui';
import { useRequest } from 'ahooks';
import { Edit3, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AbilityApi } from '../api';
import { useAbilityModel } from '../models/page';

export default function AbilityListView() {
  const {
    formProps,
    selectedRowKeys,
    setSelectedRowKeys,
    deleteAbility,
    subject,
    grade,
    actionRef,
  } = useAbilityModel();
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const {
    data,
    loading,
    refresh,
  } = useRequest(() => AbilityApi.searchAbilities({ subject: subject || undefined, grade, page, size }), {
    refreshDeps: [subject, grade, page, size],
  });

  useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  useEffect(() => {
    setPage(1);
    setSelectedRowKeys([]);
  }, [subject, grade, setSelectedRowKeys]);

  const rows = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / size));

  const handleDeleteWithConfirm = (id: number, name?: string) => {
    if (window.confirm(`确定要删除能力"${name || '该能力'}"吗？此操作无法恢复。`)) {
      deleteAbility(id);
    }
  };

  const allSelected = rows.length > 0 && rows.every((record) => selectedRowKeys.includes(record.id));
  const toggleRecord = (record: Ability, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, record.id]);
      return;
    }
    setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
  };

  const columns: DataTableColumn<Ability>[] = [
    {
      key: 'select',
      title: (
        <input
          checked={allSelected}
          type="checkbox"
          onChange={(event) => setSelectedRowKeys(event.target.checked ? rows.map((record) => record.id) : [])}
        />
      ),
      width: '48px',
      render: (record) => (
        <input
          checked={selectedRowKeys.includes(record.id)}
          type="checkbox"
          onChange={(event) => toggleRecord(record, event.target.checked)}
        />
      ),
    },
    { key: 'name', title: '能力名称' },
    {
      key: 'code',
      title: '能力标识',
      render: (record) => <span className="font-mono text-xs text-muted-foreground">{record.code}</span>,
    },
    {
      key: 'description',
      title: '描述',
      render: (record) => (
        <span className="block max-w-sm truncate" title={record.description}>
          {record.description || '-'}
        </span>
      ),
    },
    {
      key: 'difficulty',
      title: '难度',
      render: (record) => <Rating value={record.difficulty || 0} />,
    },
    {
      key: 'is_active',
      title: '状态',
      render: (record) => <StatusTag status={record.is_active === 1} trueText="启用" falseText="禁用" />,
    },
    {
      key: 'actions',
      title: '操作',
      render: (record) => (
        <div className="flex justify-start gap-2">
          <Button
            variant="outline"
            size="xs"
            icon={<Edit3 className="size-4" />}
            onClick={() => formProps.showForm(record)}
          >
            编辑
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="text-destructive"
            icon={<Trash2 className="size-4" />}
            onClick={() => handleDeleteWithConfirm(record.id, record.name)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardContent>
        <DataTable columns={columns} data={rows} loading={loading} rowKey="id" />
        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>共 {total} 条</div>
          <div className="flex items-center gap-2">
            <Button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
              上一页
            </Button>
            <span>
              第 {page} / {totalPages} 页
            </span>
            <Button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
              下一页
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

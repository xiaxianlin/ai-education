import { StatusTag } from '@/components';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  Rating,
  type DataTableColumn,
} from '@/components/ui';
import { useRequest } from 'ahooks';
import { Download, Edit3, Plus, Trash2, Upload } from 'lucide-react';
import { ChangeEvent, useEffect } from 'react';

import { AbilityApi } from '../api';
import { useAbilityModel } from '../models/page';

export default function AbilityListView() {
  const {
    formProps,
    exporting,
    importing,
    selectedRowKeys,
    setSelectedRowKeys,
    deleteAbility,
    batchDeleteAbilities,
    batchDeleteLoading,
    handleExport,
    importAbilities,
    validateFile,
    subject,
    grade,
    actionRef,
  } = useAbilityModel();

  const {
    data = [],
    loading,
    refresh,
  } = useRequest(() => AbilityApi.searchAbilities({ subject, grade }), {
    refreshDeps: [subject, grade],
  });

  useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  const handleDeleteWithConfirm = (id: number, name?: string) => {
    if (window.confirm(`确定要删除能力"${name || '该能力'}"吗？此操作无法恢复。`)) {
      deleteAbility(id);
    }
  };

  const handleBatchDeleteClick = () => {
    if (selectedRowKeys.length === 0) return;

    if (window.confirm(`确定要删除选中的 ${selectedRowKeys.length} 个能力吗？此操作无法恢复。`)) {
      batchDeleteAbilities(selectedRowKeys as number[]);
    }
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    const confirmed = window.confirm(
      `导入操作将删除当前年级的所有现有能力数据。\n文件：${file.name}\n学科：${subject}\n年级：${grade}年级\n确定要继续导入吗？`,
    );
    if (confirmed) {
      importAbilities(file);
    }
  };

  const allSelected = data.length > 0 && data.every((record) => selectedRowKeys.includes(record.id));
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
          onChange={(event) => setSelectedRowKeys(event.target.checked ? data.map((record) => record.id) : [])}
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
      className: 'text-right',
      render: (record) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit3 className="size-4" />}
            onClick={() => formProps.showForm(record)}
          >
            编辑
          </Button>
          <Button
            variant="outline"
            size="sm"
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
      <CardHeader className="flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>能力列表</CardTitle>
          <CardDescription>{loading ? '加载中...' : `${data.length} 条记录`}</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon={<Download className="size-4" />} loading={exporting} onClick={handleExport}>
            导出
          </Button>
          <label className="inline-flex">
            <input accept=".json" className="sr-only" disabled={importing} type="file" onChange={handleUpload} />
            <Button variant="outline" icon={<Upload className="size-4" />} loading={importing}>
              导入
            </Button>
          </label>
          <Button
            variant="outline"
            className="text-destructive"
            icon={<Trash2 className="size-4" />}
            disabled={selectedRowKeys.length === 0}
            loading={batchDeleteLoading}
            onClick={handleBatchDeleteClick}
          >
            批量删除 ({selectedRowKeys.length})
          </Button>
          <Button icon={<Plus className="size-4" />} onClick={() => formProps.showForm()}>
            新增能力
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} loading={loading} rowKey="id" />
      </CardContent>
    </Card>
  );
}

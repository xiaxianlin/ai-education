import { DeleteButton } from '@/components';
import { Button, Card, CardContent, DataTable, Input, type DataTableColumn } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { QuestionApi } from '../../api';
import { useQuestionListModel } from '../models/page';

export function ListView() {
  const { subject, grade, refreshKey, showForm, showDetail, handleDelete } = useQuestionListModel();
  const [page, setPage] = useState(1);
  const [size] = useState(20);
  const [id, setId] = useState('');
  const [name, setName] = useState('');

  const { data, loading } = useRequest(
    () =>
      QuestionApi.searchQuestions({
        page,
        size,
        subject,
        grade,
        id: id.trim() || undefined,
        name: name.trim() || undefined,
      }),
    {
      refreshDeps: [page, size, subject, grade, id, name, refreshKey],
      onError: (error: any) => toast.error(error?.message || '题目列表加载失败'),
    },
  );

  const rows = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / size));

  const getStemText = (question: Question) => {
    const stem = question.content?.stem || '';
    if (typeof stem === 'string') return stem;
    return String(stem || '');
  };

  const columns: DataTableColumn<Question>[] = [
    {
      key: 'content',
      title: '内容',
      render: (record) => (
        <div className="max-w-[420px]">
          <div className="truncate text-foreground">{getStemText(record) || '-'}</div>
          <div className="mt-1 truncate text-xs text-muted-foreground">{record.id}</div>
        </div>
      ),
    },
    {
      key: 'question_type',
      title: '题型名称',
      width: '180px',
      render: (record) => record.question_type?.name || '-',
    },
    {
      key: 'actions',
      title: '操作',
      width: '180px',
      className: 'text-right',
      render: (record) => (
        <div className="flex justify-end gap-2">
          <Button variant="link" onClick={() => showDetail(record)}>
            详情
          </Button>
          <Button variant="link" onClick={() => showForm(record)}>
            编辑
          </Button>
          <DeleteButton
            title="确定要删除这道题目吗？"
            onConfirm={() => handleDelete(record.id)}
            buttonProps={{ size: 'sm' }}
          />
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardContent>
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <Input
          placeholder="题目 ID"
          value={id}
          onChange={(event) => {
            setPage(1);
            setId(event.target.value);
          }}
        />
        <Input
          placeholder="名称"
          value={name}
          onChange={(event) => {
            setPage(1);
            setName(event.target.value);
          }}
        />
        <Button
          onClick={() => {
            setId('');
            setName('');
            setPage(1);
          }}
        >
          重置
        </Button>
      </div>

      <DataTable columns={columns} data={rows} rowKey="id" loading={loading} />

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

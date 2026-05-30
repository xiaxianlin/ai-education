import { useConfigs } from '@/hooks';
import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import { StudentApi } from '../../api';
import { useTextbookConfigModel } from '../models/page';

export default function TableView() {
  const { subjectEnum, gradeEnum } = useConfigs();
  const subjectMap = subjectEnum as Record<string, string>;
  const gradeMap = gradeEnum as Record<string | number, string>;
  const { studentId, subject, grade, actionRef, formProps } = useTextbookConfigModel();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, loading, refresh } = useRequest(
    () =>
      StudentApi.getStudentTextbookConfigs(studentId || '', {
        page,
        page_size: pageSize,
        subject: subject || undefined,
        grade: grade || undefined,
      }),
    {
      ready: !!studentId,
      refreshDeps: [studentId, page, pageSize, subject, grade],
    },
  );

  useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  if (!studentId) return null;

  const configs = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleDelete = async (record: StudentTextbookConfig) => {
    if (!window.confirm('确定要删除该教材配置吗？')) return;
    await StudentApi.deleteStudentTextbookConfig(studentId, record.id);
    toast.success('删除成功');
    refresh();
  };

  return (
    <section className="rounded-lg border bg-background shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">教材配置</h2>
          <p className="mt-1 text-sm text-muted-foreground">共 {total} 条配置</p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={() => formProps.showForm()}
        >
          新增配置
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">学科</th>
              <th className="px-4 py-3 font-medium">年级</th>
              <th className="px-4 py-3 font-medium">学期</th>
              <th className="px-4 py-3 font-medium">版本</th>
              <th className="px-4 py-3 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                  加载中...
                </td>
              </tr>
            )}
            {!loading && configs.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                  暂无教材配置
                </td>
              </tr>
            )}
            {!loading &&
              configs.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-3 text-foreground">
                    {subjectMap[(record.textbook as any)?.subject] || (record.textbook as any)?.subject || '-'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {gradeMap[(record.textbook as any)?.grade] || (record.textbook as any)?.grade || '-'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{(record.textbook as any)?.semester || '-'}</td>
                  <td className="px-4 py-3 text-foreground">{(record.textbook as any)?.version || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-primary/10"
                        onClick={() => formProps.showForm(record)}
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        className="rounded-md px-2 py-1 text-sm font-medium text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(record)}
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          第 {page} / {totalPages} 页
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={pageSize}
            onChange={(event) => {
              setPage(1);
              setPageSize(Number(event.target.value));
            }}
          >
            <option value={20}>20 条/页</option>
            <option value={50}>50 条/页</option>
          </select>
          <button
            type="button"
            className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            上一页
          </button>
          <button
            type="button"
            className="h-9 rounded-md border px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            下一页
          </button>
        </div>
      </div>
    </section>
  );
}

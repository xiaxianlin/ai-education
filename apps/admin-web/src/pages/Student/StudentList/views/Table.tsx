import { GRADES } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentApi } from '../../api';
import { useStudentListModel } from '../models/page';

const statusClassMap: Record<number, string> = {
  1: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  0: 'border-rose-200 bg-rose-50 text-rose-700',
};

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

export default function TableView() {
  const navigate = useNavigate();
  const {
    actionRef,
    formProps: { showForm },
    handleDelete,
  } = useStudentListModel();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');

  const { data, loading, refresh } = useRequest(
    () =>
      StudentApi.searchStudents({
        page,
        size: pageSize,
        name: keyword || undefined,
        keywords: keyword || undefined,
        status: status ? Number(status) : undefined,
      }),
    {
      refreshDeps: [page, pageSize, keyword, status],
    },
  );

  useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  const students = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="rounded-lg border bg-background shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">学生列表</h2>
          <p className="mt-1 text-sm text-muted-foreground">共 {total} 名学生</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={keyword}
            placeholder="搜索姓名或手机号"
            onChange={(event) => {
              setPage(1);
              setKeyword(event.target.value);
            }}
          />
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
          >
            <option value="">全部状态</option>
            <option value="1">启用</option>
            <option value="0">禁用</option>
          </select>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => showForm()}
          >
            新增学生
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">姓名</th>
              <th className="px-3 py-2 font-medium">手机号</th>
              <th className="px-3 py-2 font-medium">年级</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">创建时间</th>
              <th className="px-3 py-2 font-medium">更新时间</th>
              <th className="w-px whitespace-nowrap px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                  加载中...
                </td>
              </tr>
            )}
            {!loading && students.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={7}>
                  暂无学生
                </td>
              </tr>
            )}
            {!loading &&
              students.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="w-px whitespace-nowrap px-3 py-2">
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => navigate(`/student/detail/${student.id}`)}
                    >
                      {student.name}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-foreground">{student.phone}</td>
                  <td className="px-3 py-2 text-muted-foreground">{student.grade ? GRADES[student.grade] : '-'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusClassMap[student.status] || statusClassMap[0]}`}
                    >
                      {student.status === 1 ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{formatTime(student.create_time)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{formatTime(student.update_time)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-start gap-2">
                      <button
                        type="button"
                        className="h-7 rounded-md px-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(student)}
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
            <option value={10}>10 条/页</option>
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

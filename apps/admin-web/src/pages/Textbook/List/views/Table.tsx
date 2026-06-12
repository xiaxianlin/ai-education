import {
  Button,
  DataTable,
  type DataTableColumn,
} from '@/components/ui';
import { isAdminManager } from '@/constants/manager';
import { useInitialStateModel } from '@/models/initialState';
import { GRADES } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { Edit3, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { TextbookApi } from '../../api';
import { useTextbookListModel } from '../models/page';

export default function TableView() {
  const { manager } = useInitialStateModel();
  const {
    actionRef,
    subject,
    grade,
    teacherId,
    version,
    semester,
    formProps: { showForm },
  } = useTextbookListModel();
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  const {
    data,
    loading,
    refresh,
  } = useRequest(
    () =>
      TextbookApi.searchTextbooks({
        page,
        size,
        teacher_id: teacherId || undefined,
        subject: subject || undefined,
        grade,
        version: version.trim() || undefined,
        semester: semester || undefined,
      }),
    {
      refreshDeps: [page, size, subject, grade, teacherId, version, semester],
    },
  );

  useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  useEffect(() => {
    setPage(1);
  }, [subject, grade, teacherId, version, semester]);

  const rows = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const showTeacherColumn = isAdminManager(manager?.type);

  const columns: DataTableColumn<Textbook>[] = [
    ...(showTeacherColumn
      ? [
          {
            key: 'teacher_name',
            title: '教师',
            render: (record: Textbook) => record.teacher_name || '-',
          },
        ]
      : []),
    { key: 'subject', title: '科目' },
    {
      key: 'grade',
      title: '年级',
      render: (record) => GRADES[record.grade] || `${record.grade}年级`,
    },
    { key: 'version', title: '版本' },
    { key: 'semester', title: '学期' },
    {
      key: 'actions',
      title: '操作',
      render: (record) => (
        <div className="flex justify-start gap-2">
          <Link to={`/textbook/detail/${record.id}`}>
            <Button variant="outline" size="xs" icon={<Eye className="size-4" />}>
              详情
            </Button>
          </Link>
          <Button variant="outline" size="xs" icon={<Edit3 className="size-4" />} onClick={() => showForm(record)}>
            编辑
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
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
    </div>
  );
}

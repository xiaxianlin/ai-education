import { StatusTag } from '@/components';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DataTable,
  type DataTableColumn,
} from '@/components/ui';
import { useRequest } from 'ahooks';
import { Edit3, Eye, Plus } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { TeacherBookApi } from '../../api';
import { useTeacherBookListModel } from '../models/page';

export default function TableView() {
  const {
    grade,
    subject,
    actionRef,
    formProps: { showForm },
  } = useTeacherBookListModel();

  const {
    data = [],
    loading,
    refresh,
  } = useRequest(() => TeacherBookApi.searchTeacherBooks(subject, grade), {
    refreshDeps: [subject, grade],
  });

  useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  const columns: DataTableColumn<TeacherBook>[] = [
    { key: 'version', title: '版本' },
    { key: 'semester', title: '学期' },
    {
      key: 'file',
      title: '文件上传',
      render: (record) => <StatusTag status={!!record.file} trueText="已上传" falseText="未上传" />,
    },
    {
      key: 'actions',
      title: '操作',
      className: 'text-right',
      render: (record) => (
        <div className="flex justify-end gap-2">
          <Link to={`/teacher_book/detail/${record.id}`}>
            <Button variant="outline" size="sm" icon={<Eye className="size-4" />}>
              详情
            </Button>
          </Link>
          <Button variant="outline" size="sm" icon={<Edit3 className="size-4" />} onClick={() => showForm(record)}>
            编辑
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>教师用书列表</CardTitle>
          <CardDescription>{loading ? '加载中...' : `${data.length} 条记录`}</CardDescription>
        </div>
        <Button icon={<Plus className="size-4" />} onClick={() => showForm()}>
          新增教师用书
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} loading={loading} rowKey="id" />
      </CardContent>
    </Card>
  );
}

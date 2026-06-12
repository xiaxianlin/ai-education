import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  Input,
  Select,
  type DataTableColumn,
  type TableActionRef,
} from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import React from 'react';
import { AuthApi } from '../../api';
import { TeacherDetailView } from './TeacherDetailView';

export interface ManagerTableViewProps {
  actionRef: React.MutableRefObject<TableActionRef | undefined>;
  onAddClick: () => void;
}

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

const statusTextMap: Record<number, string> = {
  0: '停用',
  1: '启用',
};

const statusVariantMap: Record<number, 'success' | 'destructive'> = {
  0: 'destructive',
  1: 'success',
};

export function ManagerTableView(props: ManagerTableViewProps) {
  const { actionRef, onAddClick } = props;
  const [keyword, setKeyword] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [detailVisible, setDetailVisible] = React.useState(false);
  const [currentTeacherId, setCurrentTeacherId] = React.useState('');

  const {
    data: teachers,
    loading,
    refresh,
  } = useRequest(async () => {
    const result = await AuthApi.searchTeachers({
      keywords: keyword.trim() || undefined,
      status: statusFilter ? Number(statusFilter) : undefined,
    });
    return result;
  }, {
    refreshDeps: [keyword, statusFilter],
  });

  React.useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  const { runAsync: remove } = useRequest((id: string) => AuthApi.deleteTeacher(id), {
    manual: true,
    onSuccess: () => {
      toast.success('删除成功');
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.message || '删除失败');
    },
  });

  const { runAsync: updateStatus } = useRequest((id: string, status: number) => AuthApi.updateTeacher(id, { status }), {
    manual: true,
    onSuccess: () => {
      toast.success('状态更新成功');
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.message || '状态更新失败');
    },
  });

  const { runAsync: resetPassword } = useRequest((id: string) => AuthApi.resetTeacherPassword(id), {
    manual: true,
    onSuccess: (passwd: PasswordResponse) => {
      toast.success(`密码重置成功，新密码：${passwd.password}，请保存好密码`);
    },
    onError: (error: any) => {
      toast.error(error?.message || '密码重置失败');
    },
  });

  const handleDelete = (teacher: Teacher) => {
    if (window.confirm(`确定要删除教师 "${teacher.name || teacher.account}" 吗？`)) {
      remove(teacher.id);
    }
  };

  const handleUpdateStatus = (teacher: Teacher) => {
    if (window.confirm(`确定要${teacher.status === 1 ? '停用' : '启用'}教师 "${teacher.name || teacher.account}" 吗？`)) {
      updateStatus(teacher.id, teacher.status === 1 ? 0 : 1);
    }
  };

  const handleResetPassword = (teacher: Teacher) => {
    if (window.confirm(`确定要重置教师 "${teacher.name || teacher.account}" 的密码吗？`)) {
      resetPassword(teacher.id);
    }
  };

  const handleOpenDetail = (teacher: Teacher) => {
    setCurrentTeacherId(teacher.id);
    setDetailVisible(true);
  };

  const columns: DataTableColumn<Teacher>[] = [
    {
      key: 'account',
      title: '教师账号',
      render: (teacher) => <span className="font-medium text-foreground">{teacher.account}</span>,
    },
    {
      key: 'name',
      title: '姓名',
      render: (teacher) => teacher.name || '-',
    },
    {
      key: 'phone',
      title: '手机号',
      render: (teacher) => teacher.phone || '-',
    },
    {
      key: 'subject',
      title: '学科',
      width: '100px',
      render: (teacher) => (teacher.subject ? <Badge variant="outline">{teacher.subject}</Badge> : '-'),
    },
    {
      key: 'school',
      title: '学校',
      render: (teacher) => teacher.school || '-',
    },
    {
      key: 'status',
      title: '状态',
      width: '110px',
      render: (teacher) => <Badge variant={statusVariantMap[teacher.status] || 'destructive'}>{statusTextMap[teacher.status] || '未知'}</Badge>,
    },
    {
      key: 'create_time',
      title: '创建时间',
      width: '190px',
      render: (teacher) => <span className="text-muted-foreground">{formatTime(teacher.create_time)}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: '320px',
      render: (teacher) => (
        <div className="flex justify-start gap-2">
          <Button variant="link" size="xs" onClick={() => handleOpenDetail(teacher)}>
            详情
          </Button>
          <Button variant="ghost" size="xs" onClick={() => handleUpdateStatus(teacher)}>
            {teacher.status === 1 ? '停用' : '启用'}
          </Button>
          <Button variant="ghost" size="xs" onClick={() => handleResetPassword(teacher)}>
            重置密码
          </Button>
          <Button variant="destructive" size="xs" onClick={() => handleDelete(teacher)}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>教师列表</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">共 {teachers?.total || 0} 位教师</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input value={keyword} placeholder="搜索账号、姓名、手机号" onChange={(event) => setKeyword(event.target.value)} />
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">全部状态</option>
              <option value="1">启用</option>
              <option value="0">停用</option>
            </Select>
            <Button onClick={onAddClick}>添加教师</Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={teachers?.data || []} loading={loading} rowKey="id" emptyText="暂无教师" />
        </CardContent>
      </Card>
      <TeacherDetailView teacherId={currentTeacherId} open={detailVisible} onOpenChange={setDetailVisible} />
    </>
  );
}

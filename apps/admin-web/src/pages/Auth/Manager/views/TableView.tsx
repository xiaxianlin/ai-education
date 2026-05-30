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
import { SYSTEM_MANAGER_TYPE, TEACHER_MANAGER_TYPE } from '@/constants/manager';
import { useRequest } from 'ahooks';
import React from 'react';
import { AuthApi } from '../../api';

export interface ManagerTableViewProps {
  actionRef: React.MutableRefObject<TableActionRef | undefined>;
  onAddClick: () => void;
}

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

export function ManagerTableView(props: ManagerTableViewProps) {
  const { actionRef, onAddClick } = props;
  const [keyword, setKeyword] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');

  const {
    data: managers,
    loading,
    refresh,
  } = useRequest(async () => {
    const data = await AuthApi.getAllManagers();
    return data?.filter((item) => item.type === TEACHER_MANAGER_TYPE) || [];
  });

  React.useEffect(() => {
    actionRef.current = { reload: refresh };
  }, [actionRef, refresh]);

  const { runAsync: remove } = useRequest((id: string) => AuthApi.deleteManager(id), {
    manual: true,
    onSuccess: () => {
      toast.success('删除成功');
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.message || '删除失败');
    },
  });

  const { runAsync: updateStatus } = useRequest((id: string, status: number) => AuthApi.updateManager(id, { status }), {
    manual: true,
    onSuccess: () => {
      toast.success('状态更新成功');
      refresh();
    },
    onError: (error: any) => {
      toast.error(error?.message || '状态更新失败');
    },
  });

  const { runAsync: resetPassword } = useRequest((id: string) => AuthApi.resetManagerPassword(id), {
    manual: true,
    onSuccess: (passwd: PasswordResponse) => {
      toast.success(`密码重置成功，新密码：${passwd.password}，请保存好密码`);
    },
    onError: (error: any) => {
      toast.error(error?.message || '密码重置失败');
    },
  });

  const handleDelete = (manager: Manager) => {
    if (window.confirm(`确定要删除老师账号 "${manager.username}" 吗？`)) {
      remove(manager.id);
    }
  };

  const handleUpdateStatus = (manager: Manager) => {
    if (window.confirm(`确定要${manager.status === 1 ? '停用' : '启用'}老师账号 "${manager.username}" 吗？`)) {
      updateStatus(manager.id, manager.status === 1 ? 0 : 1);
    }
  };

  const handleResetPassword = (manager: Manager) => {
    if (window.confirm(`确定要重置老师账号 "${manager.username}" 的密码吗？`)) {
      resetPassword(manager.id);
    }
  };

  const filteredManagers = React.useMemo(() => {
    return (managers || []).filter((manager) => {
      const matchKeyword = !keyword.trim() || manager.username?.includes(keyword.trim());
      const matchStatus = !statusFilter || String(manager.status) === statusFilter;
      return matchKeyword && matchStatus;
    });
  }, [keyword, managers, statusFilter]);

  const columns: DataTableColumn<Manager>[] = [
    {
      key: 'username',
      title: '老师账号',
      render: (manager) => <span className="font-medium text-foreground">{manager.username}</span>,
    },
    {
      key: 'status',
      title: '状态',
      width: '110px',
      render: (manager) => <Badge variant={manager.status === 1 ? 'success' : 'destructive'}>{manager.status === 1 ? '启用' : '停用'}</Badge>,
    },
    {
      key: 'create_time',
      title: '创建时间',
      width: '190px',
      render: (manager) => <span className="text-muted-foreground">{formatTime(manager.create_time)}</span>,
    },
    {
      key: 'update_time',
      title: '更新时间',
      width: '190px',
      render: (manager) => <span className="text-muted-foreground">{formatTime(manager.update_time)}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: '260px',
      className: 'text-right',
      render: (manager) =>
        manager.type !== SYSTEM_MANAGER_TYPE ? (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(manager)}>
              {manager.status === 1 ? '停用' : '启用'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleResetPassword(manager)}>
              重置密码
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(manager)}>
              删除
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>老师账号列表</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">共 {filteredManagers.length} 个老师账号</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={keyword} placeholder="搜索账号" onChange={(event) => setKeyword(event.target.value)} />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">全部状态</option>
            <option value="1">启用</option>
            <option value="0">停用</option>
          </Select>
          <Button onClick={onAddClick}>
            添加老师
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={filteredManagers} loading={loading} rowKey="id" emptyText="暂无老师账号" />
      </CardContent>
    </Card>
  );
}

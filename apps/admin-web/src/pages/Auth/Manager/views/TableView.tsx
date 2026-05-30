import React from 'react';
import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { SYSTEM_MANAGER_TYPE, TEACHER_MANAGER_TYPE } from '@/constants/manager';
import { AuthApi } from '../../api';

export interface ManagerTableViewProps {
  actionRef: React.MutableRefObject<any>;
  onAddClick: () => void;
}

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

const statusClassMap: Record<number, string> = {
  1: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  0: 'border-rose-200 bg-rose-50 text-rose-700',
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
    onSuccess: (passwd: any) => {
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

  return (
    <section className="rounded-lg border bg-background shadow-sm">
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">老师账号列表</h2>
          <p className="mt-1 text-sm text-muted-foreground">共 {filteredManagers.length} 个老师账号</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={keyword}
            placeholder="搜索账号"
            onChange={(event) => setKeyword(event.target.value)}
          />
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">全部状态</option>
            <option value="1">启用</option>
            <option value="0">停用</option>
          </select>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={onAddClick}
          >
            添加老师
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">老师账号</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">创建时间</th>
              <th className="px-4 py-3 font-medium">更新时间</th>
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
            {!loading && filteredManagers.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>
                  暂无老师账号
                </td>
              </tr>
            )}
            {!loading &&
              filteredManagers.map((manager) => (
                <tr key={manager.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-foreground">{manager.username}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${statusClassMap[manager.status] || statusClassMap[0]}`}
                    >
                      {manager.status === 1 ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatTime(manager.create_time)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatTime(manager.update_time)}</td>
                  <td className="px-4 py-3">
                    {manager.type !== SYSTEM_MANAGER_TYPE && (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-sm font-medium text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(manager)}
                        >
                          删除
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-primary/10"
                          onClick={() => handleUpdateStatus(manager)}
                        >
                          {manager.status === 1 ? '停用' : '启用'}
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2 py-1 text-sm font-medium text-primary hover:bg-primary/10"
                          onClick={() => handleResetPassword(manager)}
                        >
                          重置密码
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

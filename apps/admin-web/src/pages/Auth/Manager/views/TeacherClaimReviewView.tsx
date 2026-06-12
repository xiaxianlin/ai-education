import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Select, type DataTableColumn } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import React from 'react';
import { AuthApi } from '../../api';

const statusTextMap: Record<TeacherClaimStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
};

const statusVariantMap: Record<TeacherClaimStatus, 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

const formatText = (value?: string) => value || '-';

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

export function TeacherClaimReviewView() {
  const [statusFilter, setStatusFilter] = React.useState<TeacherClaimStatus>('pending');
  const [updatingClaimId, setUpdatingClaimId] = React.useState<number>();

  const {
    data: claims,
    loading,
    refresh,
  } = useRequest(() => AuthApi.getTeacherClaims({ status: statusFilter }), {
    refreshDeps: [statusFilter],
    onError: (error: any) => {
      toast.error(error?.message || '认领申请加载失败');
    },
  });

  const { runAsync: updateClaim, loading: updateLoading } = useRequest(
    (id: number, status: UpdateTeacherClaimRequest['status']) => AuthApi.updateTeacherClaim(id, { status }),
    {
      manual: true,
      onSuccess: (_, params) => {
        const nextStatus = params[1];
        toast.success(nextStatus === 'approved' ? '已通过认领申请' : '已拒绝认领申请');
        refresh();
      },
      onError: (error: any) => {
        toast.error(error?.message || '认领申请处理失败');
      },
      onFinally: () => {
        setUpdatingClaimId(undefined);
      },
    },
  );

  const handleUpdateClaim = (claim: StudentTeacherClaim, status: UpdateTeacherClaimRequest['status']) => {
    setUpdatingClaimId(claim.id);
    updateClaim(claim.id, status).catch(() => undefined);
  };

  const columns: DataTableColumn<StudentTeacherClaim>[] = [
    {
      key: 'student',
      title: '学生',
      render: (claim) => (
        <div>
          <div className="font-medium text-foreground">{formatText(claim.student?.name)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{formatText(claim.student?.phone)}</div>
        </div>
      ),
    },
    {
      key: 'teacher',
      title: '教师',
      render: (claim) => (
        <div>
          <div className="font-medium text-foreground">{formatText(claim.teacher?.name)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{formatText(claim.teacher?.account)}</div>
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      width: '120px',
      render: (claim) => <Badge variant={statusVariantMap[claim.status]}>{statusTextMap[claim.status] || '未知'}</Badge>,
    },
    {
      key: 'create_time',
      title: '申请时间',
      width: '190px',
      render: (claim) => <span className="text-muted-foreground">{formatTime(claim.create_time)}</span>,
    },
    {
      key: 'actions',
      title: '操作',
      width: '160px',
      render: (claim) =>
        claim.status === 'pending' ? (
          <div className="flex justify-start gap-2">
            <Button
              size="xs"
              disabled={updateLoading}
              loading={updateLoading && updatingClaimId === claim.id}
              onClick={() => handleUpdateClaim(claim, 'approved')}
            >
              通过
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={updateLoading}
              onClick={() => handleUpdateClaim(claim, 'rejected')}
            >
              拒绝
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>认领审核</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">共 {claims?.length || 0} 条申请</p>
        </div>
        <Select value={statusFilter} className="w-full sm:w-40" onChange={(event) => setStatusFilter(event.target.value as TeacherClaimStatus)}>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已拒绝</option>
        </Select>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={claims || []} loading={loading} rowKey="id" emptyText="暂无认领申请" />
      </CardContent>
    </Card>
  );
}

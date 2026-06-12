import { isAdminManager } from '@/constants/manager';
import { useInitialStateModel } from '@/models/initialState';
import { Button, Select } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { GRADES } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { AuthApi } from '@/pages/Auth/api';
import { StudentApi } from '../../api';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { useStudentDetailModel } from '../models/page';
import { Footer } from './Footer';

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

export function BasicInfo() {
  const { student, refresh } = useStudentDetailModel();
  const { manager } = useInitialStateModel();
  const showTeacherInfo = isAdminManager(manager?.type);
  const [teacherId, setTeacherId] = useState('');
  const { data: teacherResult } = useRequest(() => AuthApi.searchTeachers({ size: 100, status: 1 }), {
    ready: showTeacherInfo,
  });
  const { runAsync: assignTeacher, loading: assigning } = useRequest(
    async () => StudentApi.assignStudentTeacher(student?.id || '', teacherId),
    {
      manual: true,
      onSuccess: () => {
        toast.success('关联教师成功');
        refresh();
      },
      onError: (error: any) => toast.error(error?.message || '关联教师失败'),
    },
  );

  const teachers = teacherResult?.data || [];

  return (
    <section className="rounded-lg border bg-background shadow-sm">
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-foreground">基本信息</h2>
        <Footer />
      </div>
      <dl className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">姓名</dt>
          <dd className="mt-1 font-medium text-foreground">{(student as any)?.name || '-'}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">手机号</dt>
          <dd className="mt-1 text-foreground">{(student as any)?.phone || '-'}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">年级</dt>
          <dd className="mt-1 text-foreground">
            {(student as any)?.grade !== undefined ? GRADES[(student as any).grade] : '-'}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">状态</dt>
          <dd className="mt-2">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${
                (student as any)?.status === 1
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {(student as any)?.status === 1 ? '启用' : '禁用'}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">创建时间</dt>
          <dd className="mt-1 text-foreground">{formatTime((student as any)?.create_time)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">更新时间</dt>
          <dd className="mt-1 text-foreground">{formatTime((student as any)?.update_time)}</dd>
        </div>
      </dl>
      {showTeacherInfo ? (
        <div className="border-t p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">教师信息</h3>
            <p className="mt-1 text-sm text-muted-foreground">仅管理员可查看和调整学生关联教师。</p>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">关联教师</dt>
              <dd className="mt-1 font-medium text-foreground">{student?.teacher?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">教师账号</dt>
              <dd className="mt-1 text-foreground">{student?.teacher?.account || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">学校</dt>
              <dd className="mt-1 text-foreground">{student?.teacher?.school || '-'}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={teacherId} onChange={(event) => setTeacherId(event.target.value)} className="sm:max-w-xs">
              <option value="">选择教师</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} / {teacher.account}
                </option>
              ))}
            </Select>
            <Button disabled={!teacherId || !student?.id} loading={assigning} onClick={() => assignTeacher()}>
              关联教师
            </Button>
          </div>
        </div>
      ) : null}
      <BasicInfoForm />
    </section>
  );
}

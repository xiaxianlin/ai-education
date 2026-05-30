import { GRADES } from '@ai-education/shared-web';
import { BasicInfoForm } from '../components/BasicInfoForm';
import { useStudentDetailModel } from '../models/page';
import { Footer } from './Footer';

const formatTime = (value?: number) => {
  if (!value) return '-';
  return new Date(value * 1000).toLocaleString();
};

export function BasicInfo() {
  const { student } = useStudentDetailModel();

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
      <BasicInfoForm />
    </section>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { usePracticeDetailModel } from '../models/page';

export function Progress() {
  const { session } = usePracticeDetailModel();

  if (!session) {
    return null;
  }

  const stats = [
    { label: '总题数', value: session.question_count, suffix: '题', className: 'text-slate-950' },
    { label: '已完成', value: session.answer_count, suffix: '题', className: 'text-slate-950' },
    { label: '正确', value: session.correct_count, suffix: '题', className: 'text-emerald-600' },
    {
      label: '错误',
      value: session.answer_count - session.correct_count,
      suffix: '题',
      className: 'text-red-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>练习进度</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-md border border-border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className={`mt-2 text-2xl font-semibold ${item.className}`}>
                {item.value}
                <span className="ml-1 text-sm font-normal text-muted-foreground">{item.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

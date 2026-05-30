import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatDuration } from '../../PracticeList/utils';
import { usePracticeDetailModel } from '../models/page';

export function Report() {
  const { report } = usePracticeDetailModel();

  if (!report) {
    return null;
  }

  const stats = [
    { label: '综合得分', value: report.overall_score.toFixed(1), suffix: '分' },
    { label: '能力水平', value: report.ability_level || '-', suffix: '' },
    { label: '置信度', value: (report.confidence ?? 0).toFixed(2), suffix: '' },
    { label: '总耗时', value: formatDuration(report.total_time), suffix: '' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>练习报告</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-md border border-border bg-muted/30 p-4">
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="mt-2 text-2xl font-semibold text-foreground">
                {item.value}
                {item.suffix ? <span className="ml-1 text-sm font-normal text-muted-foreground">{item.suffix}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

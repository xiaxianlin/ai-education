import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState } from '@/components/ui';
import { GRADES, SUBJECTS } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { StudentApi } from '../../api';
import { useStudentDetailModel } from '../models/page';

const MASTERY_LEVEL_CONFIG: Record<string, { label: string; variant: 'destructive' | 'warning' | 'default' | 'success' }> = {
  unlearned: { label: '未掌握', variant: 'destructive' },
  beginner: { label: '初步掌握', variant: 'warning' },
  proficient: { label: '基本掌握', variant: 'default' },
  mastered: { label: '熟练掌握', variant: 'success' },
};

export function AbilityMastery() {
  const { student } = useStudentDetailModel();

  const { data: masteryList, loading } = useRequest(() => StudentApi.getStudentMastery(student?.id || ''), {
    ready: !!student?.id,
  });

  const { data: summary } = useRequest(() => StudentApi.getStudentMasterySummary(student?.id || ''), {
    ready: !!student?.id,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>能力分析</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {summary && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">已练习能力</div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{summary.total_abilities} 个</div>
            </div>
            <div className="rounded-md border bg-muted/20 p-4">
              <div className="text-sm text-muted-foreground">平均掌握度</div>
              <div
                className={`mt-2 text-2xl font-semibold ${
                  summary.avg_mastery_score >= 60 ? 'text-emerald-600' : 'text-destructive'
                }`}
              >
                {summary.avg_mastery_score.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-md border bg-muted/20 p-4">
              <div className="mb-3 text-sm text-muted-foreground">等级分布</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.level_distribution || {}).map(([level, count]) => {
                  const config = MASTERY_LEVEL_CONFIG[level] || { label: level, variant: 'secondary' as const };
                  return (
                    <Badge key={level} variant={config.variant}>
                      {config.label}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {masteryList && masteryList.length > 0 ? (
          <DataTable
            rowKey="id"
            loading={loading}
            data={masteryList}
            columns={[
              { key: 'ability_name', title: '能力名称', render: (record: any) => record.ability_name || '-' },
              { key: 'subject', title: '科目', width: '90px', render: (record: any) => (SUBJECTS as any)[record.subject] || record.subject || '-' },
              { key: 'grade', title: '年级', width: '90px', render: (record: any) => GRADES[record.grade] || record.grade || '-' },
              {
                key: 'mastery_score',
                title: '掌握度',
                render: (record: any) => {
                  const score = Number(record.mastery_score || 0);
                  const tone = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-primary' : 'bg-destructive';
                  return (
                    <div className="min-w-40">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className={`h-full rounded-full ${tone}`} style={{ width: `${score}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{score.toFixed(1)}%</div>
                    </div>
                  );
                },
              },
              {
                key: 'mastery_level',
                title: '等级',
                width: '120px',
                render: (record: any) => {
                  const config = MASTERY_LEVEL_CONFIG[record.mastery_level] || { label: record.mastery_level, variant: 'secondary' as const };
                  return <Badge variant={config.variant}>{config.label}</Badge>;
                },
              },
              {
                key: 'practice_count',
                title: '练习次数',
                width: '120px',
                render: (record: any) => (
                  <span>
                    <span className="text-emerald-600">{record.correct_count}</span>
                    {' / '}
                    <span className="text-destructive">{record.wrong_count}</span>
                  </span>
                ),
              },
            ]}
          />
        ) : (
          <EmptyState title={loading ? '加载中...' : '暂无能力掌握度数据'} />
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CheckCircle, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import { formatDuration } from '../../PracticeList/utils';
import { ParsedReport, usePracticeDetailModel } from '../models/page';

/**
 * AI 分析区块
 */
function AISection({ report }: { report: ParsedReport }) {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 border-t pt-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h4 className="font-bold text-foreground">AI 分析报告</h4>
      </div>

      {/* 优势 */}
      {report.strengths.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-700">优势</span>
          </div>
          <ul className="space-y-1">
            {report.strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                <span className="text-green-500 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 薄弱项 */}
      {report.weaknesses.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-orange-700">薄弱项</span>
          </div>
          <ul className="space-y-1">
            {report.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 学习建议 */}
      {report.recommendations.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-blue-700">学习建议</span>
          </div>
          <ul className="space-y-1">
            {report.recommendations.map((r, i) => (
              <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 能力分解 */}
      {Object.keys(report.ability_breakdown).length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="text-sm font-semibold text-foreground mb-2">能力分解</div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(report.ability_breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium text-foreground">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Report() {
  const { report, parsedReport, hasAIReport } = usePracticeDetailModel();

  if (!report) {
    return null;
  }

  const stats = [
    { label: '综合得分', value: (report.overall_score ?? 0).toFixed(1), suffix: '分' },
    { label: '能力水平', value: report.ability_level || '-', suffix: '' },
    { label: '置信度', value: (report.confidence ?? 0).toFixed(2), suffix: '' },
    { label: '总耗时', value: formatDuration(report.total_time), suffix: '' },
    { label: '学习速度', value: report.learning_speed?.toFixed(2) || '-', suffix: '' },
    { label: '稳定性', value: report.consistency?.toFixed(2) || '-', suffix: '' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>练习报告</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 基础统计 */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

        {/* AI 分析报告 */}
        {hasAIReport && parsedReport && <AISection report={parsedReport} />}
      </CardContent>
    </Card>
  );
}

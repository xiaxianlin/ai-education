import { Space } from 'antd';
import { ProCard } from '@ant-design/pro-components';

type Props = {
  metrics: PromptMetrics | null;
};

export function MetricsOverview({ metrics }: Props) {
  return (
    <ProCard title="基础指标">
      <Space size="large">
        <div>
          <span style={{ color: '#888', marginRight: 8 }}>调用量:</span>
          <span style={{ fontSize: 18, fontWeight: 'bold' }}>{metrics?.calls ?? 0}</span>
        </div>
        <div>
          <span style={{ color: '#888', marginRight: 8 }}>成功率:</span>
          <span style={{ fontSize: 18, fontWeight: 'bold' }}>
            {metrics ? `${(metrics.success_rate * 100).toFixed(1)}%` : '-'}
          </span>
        </div>
        <div>
          <span style={{ color: '#888', marginRight: 8 }}>P95耗时:</span>
          <span style={{ fontSize: 18, fontWeight: 'bold' }}>{metrics?.p95_latency_ms ?? '-'}</span>
          <span style={{ marginLeft: 4 }}>ms</span>
        </div>
      </Space>
    </ProCard>
  );
}

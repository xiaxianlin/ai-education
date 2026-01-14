import { Card } from 'antd';

interface ConfigDetailProps {
  item: any;
}

export function ConfigDetail({ item }: ConfigDetailProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card title="媒体配置 (media_context)">
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            padding: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            maxHeight: '300px',
            overflow: 'auto',
          }}
        >
          {item?.media_context ? JSON.stringify(item.media_context, null, 2) : '-'}
        </pre>
      </Card>
      <Card title="脚手架配置 (scaffolding_config)">
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            padding: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            maxHeight: '300px',
            overflow: 'auto',
          }}
        >
          {item?.scaffolding_config ? JSON.stringify(item.scaffolding_config, null, 2) : '-'}
        </pre>
      </Card>
      <Card title="评估配置 (evaluation_config)">
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            padding: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            maxHeight: '300px',
            overflow: 'auto',
          }}
        >
          {item?.evaluation_config ? JSON.stringify(item.evaluation_config, null, 2) : '-'}
        </pre>
      </Card>
      {/* TODO: 以下配置已删除：interaction_config, resource_config, answer_config, feedback_config, cognitive_levels */}
    </div>
  );
}

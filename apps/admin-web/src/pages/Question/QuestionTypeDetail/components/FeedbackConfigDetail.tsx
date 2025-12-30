import { ProDescriptions } from '@ant-design/pro-components';
import ReactJson from '@uiw/react-json-view';
import { Card } from 'antd';

interface FeedbackConfigDetailProps {
  feedbackConfig?: any;
}

export default function FeedbackConfigDetail({ feedbackConfig }: FeedbackConfigDetailProps) {
  return (
    <Card title="反馈配置" size="small">
      <ProDescriptions column={1} size="small" bordered>
        <ProDescriptions.Item label="反馈配置">
          {feedbackConfig ? <ReactJson value={feedbackConfig} displayDataTypes={false} collapsed={1} /> : '-'}
        </ProDescriptions.Item>
      </ProDescriptions>
    </Card>
  );
}


import { RESOURCE_TYPE_LABELS } from '@ai-education/shared-web';
import { ProDescriptions } from '@ant-design/pro-components';
import ReactJson from '@uiw/react-json-view';
import { Card, Tag } from 'antd';

interface ResourceConfigDetailProps {
  resourceType?: string;
  resourceConfig?: any;
}

export default function ResourceConfigDetail({ resourceType, resourceConfig }: ResourceConfigDetailProps) {
  return (
    <Card title="资源配置" size="small">
      <ProDescriptions column={1} size="small" bordered>
        <ProDescriptions.Item label="资源类型">
          {resourceType ? (
            <Tag>{RESOURCE_TYPE_LABELS[resourceType as keyof typeof RESOURCE_TYPE_LABELS] || resourceType}</Tag>
          ) : (
            '-'
          )}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="资源配置">
          {resourceConfig ? <ReactJson value={resourceConfig} displayDataTypes={false} collapsed={1} /> : '-'}
        </ProDescriptions.Item>
      </ProDescriptions>
    </Card>
  );
}


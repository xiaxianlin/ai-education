import { Card, Descriptions, Tag } from 'antd';

interface DomainInfoProps {
  domain: AbilityDomain;
}

export default function DomainInfo({ domain }: DomainInfoProps) {
  return (
    <Card title="能力域信息" className="mb-4">
      <Descriptions column={2} bordered>
        <Descriptions.Item label="能力域名称">{domain.name}</Descriptions.Item>
        <Descriptions.Item label="能力域代码">{domain.code}</Descriptions.Item>
        <Descriptions.Item label="科目">{domain.subject}</Descriptions.Item>
        <Descriptions.Item label="状态">
          {domain.is_active === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="描述" span={2}>
          {domain.description || '-'}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

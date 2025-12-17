import { ProCard } from '@ant-design/pro-components';
import { Card } from 'antd';
import './TemplateContent.less';

interface Props {
  content: string;
}

export default function TemplateContent({ content }: Props) {
  return (
    <ProCard title="模板内容">
      <Card bordered={false}>
        <pre className="template-content-pre">
          {content || '暂无模板内容'}
        </pre>
      </Card>
    </ProCard>
  );
}

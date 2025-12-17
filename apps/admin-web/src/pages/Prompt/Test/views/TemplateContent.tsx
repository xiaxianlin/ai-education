import { ProCard } from '@ant-design/pro-components';
import { Typography } from 'antd';

interface Props {
  content: string;
}

export default function TemplateContent({ content }: Props) {
  return (
    <ProCard title="模板规则" subTitle="用于驱动 AI 生成结果的提示词模板" bordered headerBordered>
      <Typography.Paragraph>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#fafafa',
            padding: 16,
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.8,
            maxHeight: 420,
            overflow: 'auto',
            margin: 0,
            border: '1px solid #f0f0f0',
          }}
        >
          {content || '暂无模板内容'}
        </pre>
      </Typography.Paragraph>
    </ProCard>
  );
}

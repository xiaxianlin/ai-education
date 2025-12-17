import { ProCard } from '@ant-design/pro-components';
import { Typography, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface Props {
  content: string;
  generationType?: string;
  onGenerationTypeChange?: (type: string) => void;
}

export default function TemplateContent({ content, generationType = 'text', onGenerationTypeChange }: Props) {
  const items = [
    { key: 'text', label: '文本生成' },
    { key: 'image', label: '图片生成' },
    { key: 'video', label: '视频生成' },
    { key: 'audio', label: '语音生成' },
  ];

  return (
    <ProCard
      title="提示词"
      bordered
      headerBordered
      extra={
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => onGenerationTypeChange?.(key),
            selectedKeys: [generationType],
          }}
        >
          <Button>
            {items.find((item) => item.key === generationType)?.label} <DownOutlined />
          </Button>
        </Dropdown>
      }
    >
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

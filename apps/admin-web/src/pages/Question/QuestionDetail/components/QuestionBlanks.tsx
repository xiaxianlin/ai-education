import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Typography } from 'antd';

const { Text } = Typography;

interface QuestionBlanksProps {
  blanks?: Array<Record<string, unknown>>;
}

export function QuestionBlanks({ blanks }: QuestionBlanksProps) {
  if (!blanks || blanks.length === 0) {
    return null;
  }

  return (
    <ProCard title="填空位置">
      <ProDescriptions column={1} size="small">
        {blanks.map((blank, index) => (
          <ProDescriptions.Item key={index} label={`第 ${index + 1} 空`}>
            <Text code style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(blank, null, 2)}
            </Text>
          </ProDescriptions.Item>
        ))}
      </ProDescriptions>
    </ProCard>
  );
}


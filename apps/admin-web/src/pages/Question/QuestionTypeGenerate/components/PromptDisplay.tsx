import { EditOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';
import { useQuestionTypeGenerateModel } from '../models/page';

export function PromptDisplay() {
  const { prompt, handleEditPrompt } = useQuestionTypeGenerateModel();

  return (
    <Card
      title="提示词"
      extra={
        <Button type="link" icon={<EditOutlined />} onClick={handleEditPrompt} size="small">
          编辑
        </Button>
      }
    >
      {prompt ? (
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            padding: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            maxHeight: '400px',
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
        >
          {prompt}
        </pre>
      ) : (
        <div style={{ color: '#999', textAlign: 'center', padding: '20px' }}>暂无提示词</div>
      )}
    </Card>
  );
}


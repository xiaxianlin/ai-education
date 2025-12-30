import { PlayCircleOutlined } from '@ant-design/icons';
import { Button, Card, InputNumber, Space } from 'antd';
import { useQuestionTypeGenerateModel } from '../models/page';

export function GenerateControl() {
  const { count, setCount, handleGenerate, generating } = useQuestionTypeGenerateModel();

  return (
    <Card>
      <Space>
        <span>生成数量：</span>
        <InputNumber
          min={1}
          max={100}
          value={count}
          onChange={(value) => setCount(value || 10)}
          disabled={generating}
          style={{ width: 120 }}
        />
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={handleGenerate}
          loading={generating}
          disabled={generating}
        >
          生成
        </Button>
      </Space>
    </Card>
  );
}


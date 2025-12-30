import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Card, Space } from 'antd';
import { useQuestionTypeGenerateModel } from '../models/page';

export function ActionBar() {
  const { hasUnsavedChanges, handleSave, handleDelete, saving, deleting } =
    useQuestionTypeGenerateModel();

  if (!hasUnsavedChanges) {
    return null;
  }

  return (
    <Card>
      <Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
          disabled={saving || deleting}
        >
          保存（启用题目）
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleDelete}
          loading={deleting}
          disabled={saving || deleting}
        >
          删除
        </Button>
      </Space>
    </Card>
  );
}


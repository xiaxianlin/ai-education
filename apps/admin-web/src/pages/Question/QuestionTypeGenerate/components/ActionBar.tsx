import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Space } from 'antd';
import { useQuestionTypeGenerateModel } from '../models/page';

export function ActionBar() {
  const { hasUnsavedChanges, handleDelete, deleting } = useQuestionTypeGenerateModel();

  if (!hasUnsavedChanges) {
    return null;
  }

  return (
    <Card>
      <Space>
        {/* TODO: 保存（启用题目）功能已废弃，原 is_active 字段已删除 */}
        <Button danger icon={<DeleteOutlined />} onClick={handleDelete} loading={deleting} disabled={deleting}>
          删除
        </Button>
      </Space>
    </Card>
  );
}

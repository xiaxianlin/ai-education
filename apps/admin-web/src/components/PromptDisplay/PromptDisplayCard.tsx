import { EditOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, Card, Space } from 'antd';

interface PromptDisplayCardProps {
  /** 提示词内容 */
  prompt?: string;
  /** 是否显示优化按钮 */
  showOptimize?: boolean;
  /** 是否显示编辑按钮 */
  showEdit?: boolean;
  /** 优化按钮点击回调 */
  onOptimize?: () => void;
  /** 编辑按钮点击回调 */
  onEdit?: () => void;
}

export function PromptDisplayCard({
  prompt,
  showOptimize = true,
  showEdit = true,
  onOptimize,
  onEdit,
}: PromptDisplayCardProps) {
  return (
    <Card
      title="提示词"
      extra={
        <Space>
          {showOptimize && onOptimize && (
            <Button type="link" icon={<ThunderboltOutlined />} onClick={onOptimize} size="small">
              优化
            </Button>
          )}
          {showEdit && onEdit && (
            <Button type="link" icon={<EditOutlined />} onClick={onEdit} size="small">
              编辑
            </Button>
          )}
        </Space>
      }
    >
      {prompt ? (
        <pre className="whitespace-pre-wrap break-words m-0 p-4 bg-gray-100 rounded max-h-[406px] overflow-auto text-[13px] leading-[1.6]">
          {prompt}
        </pre>
      ) : (
        <div className="text-gray-400 text-center py-5">暂无提示词</div>
      )}
    </Card>
  );
}

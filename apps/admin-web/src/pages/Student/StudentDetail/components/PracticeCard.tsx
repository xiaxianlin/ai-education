import { DeleteOutlined, RocketOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Checkbox, Flex, Modal } from 'antd';

export function PracticeCard({
  practice,
  selected,
  onSelect,
  onDelete,
}: {
  practice: Practice;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onDelete?: () => void;
}) {
  const handleDelete = () => {
    Modal.confirm({
      title: '移除练习',
      content: '确定要移除该练习吗？',
      onOk: onDelete,
    });
  };

  return (
    <div className="relative group">
      <Card hoverable size="small">
        <div style={{ padding: '12px 0' }}>
          <Card.Meta
            avatar={<Avatar shape="square" size={56} icon={<RocketOutlined />} src={practice.icon} />}
            title={
              <Flex align="center" gap={8}>
                <span>{practice.name}</span>
              </Flex>
            }
            description={practice.description || '暂无描述'}
          />
        </div>
      </Card>
      {onSelect && (
        <Checkbox
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="absolute top-2 left-2 z-10"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <Button
        danger
        size="small"
        type="text"
        onClick={handleDelete}
        icon={<DeleteOutlined />}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
      />
    </div>
  );
}

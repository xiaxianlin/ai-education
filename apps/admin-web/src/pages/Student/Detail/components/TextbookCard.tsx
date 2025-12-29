import { GRADES } from '@ai-education/shared-web';
import { BookOutlined, DeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Checkbox, Flex, Modal, Tag } from 'antd';
;

export function TextbookCard({
  textbook,
  active,
  selected,
  onSelect,
  onDelete,
}: {
  textbook: Textbook;
  active?: boolean;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onDelete?: () => void;
}) {
  const handleDelete = () => {
    Modal.confirm({
      title: '删除教材',
      content: '确定要删除该教材吗？',
      onOk: onDelete,
    });
  };

  return (
    <div className="relative group">
      <Card hoverable size="small">
        <div style={{ padding: '12px 0' }}>
          <Card.Meta
            avatar={<Avatar shape="square" size={56} icon={<BookOutlined />} />}
            title={
              <Flex align="center" gap={8}>
                <span>{textbook.subject}</span>
                {active && <Tag color="success">当前阶段</Tag>}
              </Flex>
            }
            description={`${textbook.version} | ${GRADES[textbook.grade]} | ${textbook.semester}`}
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

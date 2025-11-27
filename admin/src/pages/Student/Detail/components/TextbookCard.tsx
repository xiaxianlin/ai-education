import { BookOutlined, DeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Tag } from 'antd';
import { GRADES } from '@/constants/course';

export function TextbookCard({
  textbook,
  active,
  onDelete,
}: {
  textbook: Textbook;
  active?: boolean;
  onDelete?: () => void;
}) {
  return (
    <Card
      hoverable
      size="small"
      style={{ width: 300 }}
      title={active ? <Tag color="green">当前使用</Tag> : undefined}
      extra={
        <Button
          key="delete"
          danger
          size="small"
          type="text"
          onClick={onDelete}
          icon={<DeleteOutlined />}
        />
      }
    >
      <div style={{ padding: '12px 0' }}>
        <Card.Meta
          avatar={<Avatar shape="square" size={56} icon={<BookOutlined />} />}
          title={textbook.subject}
          description={`${textbook.version} - ${GRADES[textbook.grade]?.grade} - ${
            textbook.semester
          }`}
        />
      </div>
    </Card>
  );
}

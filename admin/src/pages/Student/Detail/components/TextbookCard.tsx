import { BookOutlined, DeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Tag } from 'antd';
import { GRADES } from '@/constants/course';

export function TextbookCard({
  textbook,
  onDelete,
}: {
  textbook: Textbook;
  onDelete?: () => void;
}) {
  return (
    <Card
      hoverable
      size="small"
      style={{ width: 300 }}
      actions={[
        <Button
          key="delete"
          danger
          size="small"
          type="text"
          onClick={onDelete}
          icon={<DeleteOutlined />}
        >
          删除
        </Button>,
      ]}
    >
      <div style={{ padding: '12px 0' }}>
        <Card.Meta
          avatar={<Avatar shape="square" size={56} icon={<BookOutlined />} />}
          title={textbook.subject}
          description={`${textbook.version} | ${GRADES[textbook.grade]} | ${textbook.semester}`}
        />
      </div>
    </Card>
  );
}

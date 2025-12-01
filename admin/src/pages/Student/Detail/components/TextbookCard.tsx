import { BookOutlined, DeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Flex, Tag } from 'antd';
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
          title={
            <Flex align="center" gap={8}>
              <span>{textbook.subject}</span>
              {active && <Tag color="success">正在使用</Tag>}
            </Flex>
          }
          description={`${textbook.version} | ${GRADES[textbook.grade]} | ${textbook.semester}`}
        />
      </div>
    </Card>
  );
}

import { DeleteOutlined, RocketOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Flex } from 'antd';

export function PracticeCard({ practice, onDelete }: { practice: Practice; onDelete?: () => void }) {
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
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          icon={<DeleteOutlined />}
        >
          移除
        </Button>,
      ]}
    >
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
  );
}

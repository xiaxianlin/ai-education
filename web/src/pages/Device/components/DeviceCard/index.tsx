import { Info, InfoItem } from '@/components/Info';
import { fmtTime } from '@/utils/time';
import { EditOutlined, PhoneFilled } from '@ant-design/icons';
import { Button, Card, Switch } from 'antd';
import styles from './index.less';
interface DeviceCardProps {
  device: Device;
  onEdit?: () => void;
  onCall?: () => void;
  onStatusChange?: (status: number) => void;
}

export function DeviceCard({ device, onEdit, onCall, onStatusChange }: DeviceCardProps) {
  const isOnline = !!device.robot?.status;
  return (
    <Card
      bordered
      className={styles.card}
      title={device.name}
      actions={[
        <Button type="text" icon={<EditOutlined />} key="edit" onClick={onEdit}>
          编辑
        </Button>,
        <Button disabled={!isOnline} type="text" icon={<PhoneFilled />} key="call" onClick={onCall}>
          拨打
        </Button>,
      ]}
    >
      <Info>
        <InfoItem label="设备类型">机器人</InfoItem>
        <InfoItem label="设备状态">
          <Switch
            checkedChildren="在线"
            unCheckedChildren="离线"
            checked={isOnline}
            onChange={(checked) => onStatusChange?.(Number(checked))}
          />
        </InfoItem>
        <InfoItem label="注册时间">{fmtTime(device.create_time)}</InfoItem>
      </Info>
    </Card>
  );
}

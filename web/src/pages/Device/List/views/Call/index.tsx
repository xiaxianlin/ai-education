import { Modal } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { RobotChat } from '@/pages/Device/components';
import { useRobotCallModel } from '../../models/call';
import styles from './index.less';

export default function CallView() {
  const { robot, visible, hideCallDrawer } = useRobotCallModel();
  return (
    <Modal
      centered
      destroyOnClose
      open={visible}
      onCancel={hideCallDrawer}
      maskClosable={false}
      footer={null}
      closable={false}
      width={375}
      styles={{
        header: {
          display: 'none',
        },
        content: {
          background: 'transparent',
          padding: 0,
        },
      }}
    >
      <RobotChat robot={robot!} />
      <div className={styles.close}>
        <CloseCircleOutlined onClick={hideCallDrawer} />
      </div>
    </Modal>
  );
}

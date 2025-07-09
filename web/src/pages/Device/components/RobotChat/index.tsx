import { Avatar } from 'antd';
import avatar from '@/assets/phone/avatar.jpg';
import styles from './index.less';
import { PauseCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { RobotChatProps, useModel } from './useModel';
export function RobotChat(props: RobotChatProps) {
  const { refs, state, startRecord, stopRecord } = useModel(props);
  const { recorder } = state;
  return (
    <div className={styles.container}>
      <div className={styles.phone}>
        <div className={styles.avatar}>
          <Avatar src={avatar} size={80} />
          <h1>{props.robot.nickname}</h1>
        </div>
        <div className={styles.wave}>
          <canvas ref={refs.canvasRef} width={320} height={200}></canvas>
        </div>
        <div className={styles.call}>
          {recorder ? (
            <Avatar icon={<PauseCircleOutlined />} size={60} onClick={stopRecord} />
          ) : (
            <Avatar icon={<PhoneOutlined />} size={60} onClick={startRecord} />
          )}
        </div>
      </div>
    </div>
  );
}

import logo from '@/assets/logo.png';
import AuthLayout from '@/layouts/AuthLayout';
import { Flex } from 'antd';
import styles from './index.less';
import FormView from '../Form';
export default function MainView() {
  return (
    <AuthLayout>
      <div className={styles.card}>
        <Flex className={styles.title} justify="center">
          <img className={styles.logo} src={logo} />
          <span className={styles.name}>观澜智科</span>
        </Flex>
        <div className={styles.subtitle}>您身边最好用的 AI 服务</div>
        <FormView />
      </div>
    </AuthLayout>
  );
}

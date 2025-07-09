import { Link } from '@umijs/max';
import { Button, Flex } from 'antd';
import styles from '../index.less';

export default function OtherLogin() {
  return (
    <Flex className={styles.other} justify="space-between" align="center">
      <Link to="/register">注册账户</Link>
      <Button type="link">微信登录 {'>>'}</Button>
    </Flex>
  );
}

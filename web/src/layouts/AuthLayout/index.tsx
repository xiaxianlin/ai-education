import styles from './index.less';
export default function AuthLayout(props: any) {
  return (
    <div className={styles.layout}>
      <div className={styles.container}>{props.children}</div>
    </div>
  );
}

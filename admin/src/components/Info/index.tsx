import { PropsWithChildren } from 'react';
import styles from './index.less';

export function Info({ children }: PropsWithChildren) {
  return <div className={styles.info}>{children}</div>;
}

export function InfoItem({ label, children }: PropsWithChildren<{ label?: string }>) {
  return (
    <div className={styles.item}>
      <label>{label}:</label>
      <span>{children}</span>
    </div>
  );
}

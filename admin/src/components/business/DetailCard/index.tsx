import { Card, CardProps } from 'antd';
import { ReactNode } from 'react';

interface DetailCardProps extends CardProps {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
}

/**
 * 通用详情卡片组件
 * 封装了常用的 Card 配置
 */
export function DetailCard({ title, extra, children, ...props }: DetailCardProps) {
  return (
    <Card
      title={title}
      extra={extra}
      bordered={false}
      style={{ marginBottom: 16 }}
      {...props}
    >
      {children}
    </Card>
  );
}

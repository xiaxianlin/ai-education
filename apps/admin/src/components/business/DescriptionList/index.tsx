import { Descriptions, DescriptionsProps } from 'antd';
import { ReactNode } from 'react';

interface DescriptionItem {
  label: string;
  value: ReactNode;
  span?: number;
}

interface DescriptionListProps extends Omit<DescriptionsProps, 'items'> {
  items: DescriptionItem[];
}

/**
 * 通用描述列表组件
 * 封装了 Descriptions 组件，简化使用
 */
export function DescriptionList({ items, column = 2, ...props }: DescriptionListProps) {
  return (
    <Descriptions column={column} {...props}>
      {items.map((item, index) => (
        <Descriptions.Item key={index} label={item.label} span={item.span}>
          {item.value || '-'}
        </Descriptions.Item>
      ))}
    </Descriptions>
  );
}

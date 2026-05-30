import { DescriptionList as UiDescriptionList } from '@/components/ui';
import type { ReactNode } from 'react';

interface DescriptionItem {
  label: string;
  value: ReactNode;
  span?: number;
}

interface DescriptionListProps {
  items: DescriptionItem[];
  column?: number;
}

export function DescriptionList({ items }: DescriptionListProps) {
  return <UiDescriptionList items={items} />;
}

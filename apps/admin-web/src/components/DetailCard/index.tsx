import { Card, CardContent, CardTitle } from '@/components/ui';
import type { ReactNode } from 'react';

interface DetailCardProps {
  title: string;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DetailCard({ title, extra, children, className }: DetailCardProps) {
  return (
    <Card className={className}>
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{title}</CardTitle>
        {extra}
      </div>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

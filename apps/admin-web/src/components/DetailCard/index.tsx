import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
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
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {extra}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

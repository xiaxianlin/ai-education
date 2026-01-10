import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export const StatCard: FC<StatCardProps> = ({ title, value, icon, description, className }) => {
  return (
    <Card className={cn("bg-white border-4 border-white shadow-xl shadow-primary/5", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-bold text-muted-foreground">{title}</p>
            <p className="text-3xl font-black text-foreground">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
          {icon && (
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary text-2xl">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

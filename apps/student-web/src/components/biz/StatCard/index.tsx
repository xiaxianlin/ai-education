import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export const StatCard: FC<StatCardProps> = ({ title, value, icon, description, className }) => {
  return (
    <Card className={cn("bg-white border-4 border-white shadow-xl shadow-primary/5", className)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary text-xl shrink-0">
              {icon}
            </div>
          )}
          <div className="space-y-1.5 flex-1 min-w-0">
            <p className="text-xs font-bold text-muted-foreground">{title}</p>
            {typeof value === "string" || typeof value === "number" ? (
              <p className="text-2xl font-black text-foreground">{value}</p>
            ) : (
              <div className="text-2xl font-black">{value}</div>
            )}
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

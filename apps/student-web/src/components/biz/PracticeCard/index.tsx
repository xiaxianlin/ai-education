import { FC } from "react";
import { Link } from "react-router-dom";
interface PracticeCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  path: string;
}

export const PracticeCard: FC<PracticeCardProps> = ({ title, description, icon, path }) => {
  return (
    <Link to={path}>
      <div className="relative overflow-hidden bg-card rounded-3xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative p-8 flex flex-col gap-6">
          {/* 内容区域 */}
          <div className="flex items-center justify-center gap-2">
            <div className="text-4xl">{icon}</div>
            <h3 className="text-2xl font-bold text-foreground">{title}</h3>
          </div>
          <p className="text-base text-muted-foreground text-center">{description}</p>
        </div>
      </div>
    </Link>
  );
};

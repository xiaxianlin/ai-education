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
    <Link to={path} className="group block">
      <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 h-full border-4 border-white shadow-xl shadow-primary/5 bubbly-card">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 group-hover:bg-accent/20 transition-colors" />

        <div className="relative flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 flex items-center justify-center rounded-[2rem] bg-secondary/80 text-5xl animate-float transition-transform group-hover:scale-110">
            {icon}
          </div>
          <div className="space-y-3">
            <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed">{description}</p>
          </div>
          <div className="mt-2 w-full py-3 rounded-2xl bg-primary/5 text-primary text-sm font-black group-hover:bg-primary group-hover:text-white transition-all">
            开始练习 →
          </div>
        </div>
      </div>
    </Link>
  );
};

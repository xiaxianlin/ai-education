/**
 * 返回按钮组件
 */
import { FC, memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: FC<BackButtonProps> = memo(
  ({ onClick, label = "返回" }) => {
    return (
      <Button
        variant="outline"
        onClick={onClick}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        {label}
      </Button>
    );
  }
);

BackButton.displayName = "BackButton";


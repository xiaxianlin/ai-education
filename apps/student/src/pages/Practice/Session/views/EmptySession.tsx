/**
 * 空会话视图 - 会话不存在或异常
 */
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const EmptySession = memo(() => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          练习会话不存在
        </h2>
        <Button onClick={handleBack}>返回</Button>
      </div>
    </div>
  );
});

EmptySession.displayName = "EmptySession";


/**
 * 练习会话加载 Hook
 * 负责根据 URL 中的 sessionId 加载会话详情，并在失败时处理导航与提示
 */
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSessionStore } from "../stores/session-store";

export function useSessionLoader() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const loadSession = useSessionStore((state) => state.loadSession);

  useEffect(() => {
    if (!sessionId) return;

    loadSession(Number(sessionId)).catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : "加载练习失败";
      toast.error(errorMessage);
      navigate("/home");
    });
    // 仅在 sessionId 变化时重新加载
  }, [sessionId, loadSession, navigate]);
}



import { useCallback, useState } from "react";
import { practiceService } from "@/services/practice";
import { useSessionStore } from "../stores/session-store";
import { useCurrentQuestion } from "../stores/session-store";

interface UseAudioUploadResult {
  upload: (audioBlob: Blob) => Promise<UploadRecordingResult>;
  uploading: boolean;
}

/**
 * 口语题录音上传与解析 Hook
 * - 调用后端录音上传接口
 * - 返回 OSS 存储路径和 ASR 解析文本
 */
export const useAudioUpload = (): UseAudioUploadResult => {
  const [uploading, setUploading] = useState(false);
  const session = useSessionStore((state) => state.session);
  const currentQuestion = useCurrentQuestion();

  const upload = useCallback(
    async (audioBlob: Blob): Promise<UploadRecordingResult> => {
      if (!session || !currentQuestion) {
        throw new Error("会话或当前题目不存在");
      }

      setUploading(true);
      try {
        const result = await practiceService.uploadRecording(
          session.id,
          currentQuestion.id,
          audioBlob
        );
        return result;
      } finally {
        setUploading(false);
      }
    },
    [session, currentQuestion]
  );

  return { upload, uploading };
};



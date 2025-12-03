/**
 * 口语题录音输入组件
 */
import { FC, memo, useState, useCallback } from "react";
import { AudioRecorder } from "@/components/business/AudioRecorder";
import { toast } from "sonner";
import { useAudioUpload } from "../../hooks/useAudioUpload";

interface AudioInputProps {
  value?: string; // OSS 存储路径
  disabled?: boolean;
  hasAnswered?: boolean;
  onChange: (answer: string, audioOssPath: string) => void;
  maxDuration?: number;
}

export const AudioInput: FC<AudioInputProps> = memo(
  ({ value, disabled, hasAnswered, onChange, maxDuration = 60 }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { upload, uploading } = useAudioUpload();

    const handleRecordingComplete = useCallback(
      async (audioBlob: Blob) => {
        if (hasAnswered || disabled) {
          return;
        }

        try {
          setIsProcessing(true);
          // 上传录音并进行 ASR 解析
          const result = await upload(audioBlob);
          // 使用解析后的文本作为答案，OSS 路径作为音频答案存储
          onChange(result.transcription, result.oss_path);
          toast.success("录音已上传并解析完成，请点击提交按钮");
        } catch (error) {
          console.error("处理录音失败:", error);
          toast.error(
            error instanceof Error ? error.message : "处理录音失败"
          );
        } finally {
          setIsProcessing(false);
        }
      },
      [hasAnswered, disabled, onChange, upload]
    );

    return (
      <div className="flex flex-col items-center gap-6">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={hasAnswered || disabled || isProcessing || uploading}
          maxDuration={maxDuration}
        />
        {value && !hasAnswered && (
          <div className="text-sm text-muted-foreground">
            录音已完成，请点击提交按钮
          </div>
        )}
        {hasAnswered && (
          <div className="text-sm text-muted-foreground">答案已提交</div>
        )}
      </div>
    );
  }
);

AudioInput.displayName = "AudioInput";


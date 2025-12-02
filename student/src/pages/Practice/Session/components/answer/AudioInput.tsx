/**
 * 口语题录音输入组件
 */
import { FC, memo, useState, useCallback } from "react";
import { AudioRecorder } from "@/components/business/AudioRecorder";
import { toast } from "sonner";

interface AudioInputProps {
  value?: string; // base64 字符串或 data URL
  disabled?: boolean;
  hasAnswered?: boolean;
  onChange: (answer: string, audioBase64: string) => void;
  maxDuration?: number;
}

/**
 * 将 Blob 转换为 base64 字符串
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // 移除 data URL 前缀，只保留 base64 数据
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const AudioInput: FC<AudioInputProps> = memo(
  ({ value, disabled, hasAnswered, onChange, maxDuration = 60 }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleRecordingComplete = useCallback(
      async (audioBlob: Blob) => {
        if (hasAnswered || disabled) {
          return;
        }

        try {
          setIsProcessing(true);
          // 将音频转换为 base64
          const base64Data = await blobToBase64(audioBlob);
          // 口语题的答案通过 ASR 解析，这里传递 base64 数据
          // 实际的文本答案由后端 ASR 解析后返回
          onChange("", base64Data);
          toast.success("录音已完成，请点击提交按钮");
        } catch (error) {
          console.error("处理录音失败:", error);
          toast.error(
            error instanceof Error ? error.message : "处理录音失败"
          );
        } finally {
          setIsProcessing(false);
        }
      },
      [hasAnswered, disabled, onChange]
    );

    return (
      <div className="flex flex-col items-center gap-6">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={hasAnswered || disabled || isProcessing}
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


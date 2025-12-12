/**
 * 口语题录音输入组件
 */
import { FC, memo, useState, useCallback } from "react";
import { AudioRecorder } from "@/components/business/AudioRecorder";
import { toast } from "sonner";
import { useAudioUpload } from "../../hooks/useAudioUpload";

/** 录音上传结果 */
interface UploadRecordingResult {
  text: string;
  match: boolean;
  analysis: string;
}

interface AudioInputProps {
  value?: string; // 任意非空值表示“已录制并完成解析”
  disabled?: boolean;
  hasAnswered?: boolean;
  onChange: (answerText: string, analysis: UploadRecordingResult) => void;
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
          // 上传录音并进行音频理解（包含 ASR 解析和匹配分析）
          const result = await upload(audioBlob);
          // 验证返回结果
          if (!result || !result.text) {
            throw new Error("上传录音失败：返回数据不完整");
          }
          // 后端会把 oss_path 写入 PracticeAnswer.audio_answer，这里仅保存解析文本与分析结果用于提交
          onChange(result.text, result);
          toast.success("录音已解析完成，请点击提交按钮");
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


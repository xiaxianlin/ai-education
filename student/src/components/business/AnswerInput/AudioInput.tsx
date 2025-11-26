/**
 * 口语题录音输入组件
 */
import { FC } from "react";
import { AudioRecorder } from "@/components/business/AudioRecorder";
import AudioPlayer from "@/components/business/AudioPlayer";
import type { AnswerInputProps } from "./types";

export const AudioInput: FC<AnswerInputProps> = ({
  value,
  disabled,
  onChange,
}) => {
  const handleRecordingComplete = (audioBlob: Blob) => {
    // 将 Blob 转换为 URL
    const audioUrl = URL.createObjectURL(audioBlob);
    onChange("", audioUrl);
  };

  return (
    <div className="space-y-4">
      {value ? (
        <AudioPlayer src={value} />
      ) : (
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={disabled}
        />
      )}
    </div>
  );
};

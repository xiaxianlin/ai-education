/**
 * 录音组件
 * 支持开始/停止录音，并返回录音文件
 */
import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  disabled?: boolean;
  /**
   * 最大录音时长（秒），默认 60 秒
   */
  maxDuration?: number;
  onComplete: (audioBlob: Blob) => void;
}

export function AudioRecorder({ onComplete, disabled = false, maxDuration = 60 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      // 清理定时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // 停止录音
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setIsProcessing(true);
        onComplete(audioBlob);
        setIsProcessing(false);

        // 停止所有音频轨道
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 开始计时
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // 达到最大时长自动停止
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("无法访问麦克风:", error);
      alert("无法访问麦克风，请检查权限设置");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={disabled || isProcessing}
            className={cn(
              "h-16 w-16 rounded-full shadow-lg",
              "bg-gradient-to-br from-red-500 to-rose-600",
              "hover:from-red-600 hover:to-rose-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Mic className="h-8 w-8 text-white" />
            )}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            disabled={disabled}
            className={cn(
              "h-16 w-16 rounded-full shadow-lg",
              "bg-gradient-to-br from-gray-500 to-gray-600",
              "hover:from-gray-600 hover:to-gray-700",
              "animate-pulse"
            )}
          >
            <Square className="h-8 w-8 text-white" />
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">{formatTime(recordingTime)}</div>
          <div className="text-sm text-gray-600">正在录音...</div>
        </div>
      )}

      {!isRecording && recordingTime === 0 && <div className="text-sm text-gray-500 text-center">点击按钮开始录音</div>}
    </div>
  );
}

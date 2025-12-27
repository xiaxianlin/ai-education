import { cn } from "@/lib/utils";
import { Mic, Play, Square, Trash2, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import type { InteractionInputProps } from "../types";

/**
 * 语音录制输入组件
 */
export function VoiceInput({ value, disabled, onChange }: InteractionInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>((value as string) || null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // 开始录音
  const startRecording = async () => {
    if (disabled) return;
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
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        // 在实际应用中，这里应该上传文件到服务器并返回 URL
        onChange(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("无法访问麦克风，请检查权限。");
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // 播放/暂停
  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 删除录音
  const deleteAudio = () => {
    if (disabled) return;
    setAudioUrl(null);
    onChange("");
    if (audioUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-3xl border-2 border-dashed border-border gap-6">
      <audio ref={audioPlayerRef} src={audioUrl || ""} onEnded={() => setIsPlaying(false)} className="hidden" />

      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-foreground">
          {isRecording ? "正在录音..." : audioUrl ? "录音已完成" : "点击开始录音"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isRecording ? formatTime(duration) : audioUrl ? "你可以播放试听或重录" : "请清晰说出你的答案"}
        </p>
      </div>

      <div className="relative flex items-center justify-center gap-6">
        {/* 录音按钮 */}
        {!audioUrl && !isRecording && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className={cn(
              "w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg",
              "hover:scale-105 transition-all active:scale-95 duration-200",
              disabled && "opacity-50 grayscale cursor-not-allowed"
            )}
          >
            <Mic className="w-8 h-8" />
          </button>
        )}

        {/* 停止录音按钮 */}
        {isRecording && (
          <button
            onClick={stopRecording}
            className={cn(
              "w-20 h-20 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg",
              "animate-pulse shadow-destructive/50"
            )}
          >
            <Square className="w-8 h-8 fill-current" />
          </button>
        )}

        {/* 录音完成后的控制 */}
        {audioUrl && !isRecording && (
          <div className="flex items-center gap-4 animate-in zoom-in-50 duration-300">
            <button
              onClick={deleteAudio}
              disabled={disabled}
              className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayback}
              className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? <Square className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>

            <button
              onClick={startRecording}
              disabled={disabled}
              className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* 音波模拟动画 (录音时显示) */}
      {isRecording && (
        <div className="flex items-end gap-1 h-8">
          {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-bounce"
              style={{
                height: `${h * 20}%`,
                animationDelay: `${i * 100}ms`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      )}

      {/* 提示文案 */}
      {audioUrl && (
        <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-4 py-2 rounded-full">
          <Volume2 className="w-4 h-4" />
          <span>点击播放试听语音</span>
        </div>
      )}
    </div>
  );
}

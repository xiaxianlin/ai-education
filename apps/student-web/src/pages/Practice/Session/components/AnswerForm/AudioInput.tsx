/**
 * 口语题录音输入组件
 */
import { Button } from "@/components/ui";
import { studentApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRequest } from "ahooks";
import { CheckCircle, Loader2, Mic, RotateCcw, XCircle } from "lucide-react";
import { useRef, useState } from "react";

type RecordingState = "idle" | "recording" | "parsing" | "success" | "failure";

export function AudioInput({ value, disabled, onChange }: AnswerFormProps) {
  const [state, setState] = useState<RecordingState>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { run: analyze } = useRequest(
    (data: Blob) => studentApi.audioAnswerAnalyze(data),
    {
      manual: true,
      onBefore: () => setState("parsing"),
      onSuccess: (res) => {
        onChange({
          ...value,
          text_answer: res.text,
          analysis: res.analysis,
        } as PracticeAnswer);
        setState("success");
      },
      onError: (error) => {
        setErrorMessage(error.message || "录音解析失败");
        setState("failure");
      },
    }
  );

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
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        analyze(blob);

        // 停止所有音频轨道
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setState("recording");
      setRecordingTime(0);

      // 开始计时
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          // 达到最大时长自动停止
          if (newTime >= 10) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error("无法访问麦克风:", error);
      setErrorMessage("无法访问麦克风，请检查权限设置");
      setState("failure");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === "recording") {
      mediaRecorderRef.current.stop();
      setState("idle");

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleReRecord = () => {
    // 清理旧的音频 URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl("");
    setErrorMessage("");
    setRecordingTime(0);
    setState("idle");

    // 清空答案
    onChange({
      ...value,
      text_answer: "",
      analysis: "",
    } as PracticeAnswer);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* 录音按钮 / 停止按钮 */}
      {state === "idle" && (
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={startRecording}
            disabled={disabled}
            className={cn(
              "h-20 w-20 rounded-full shadow-lg",
              "bg-gradient-to-br from-red-500 to-rose-600",
              "hover:from-red-600 hover:to-rose-700",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Mic className="h-10 w-10 text-white" />
          </Button>
          <div className="text-sm text-muted-foreground">点击按钮开始录音</div>
        </div>
      )}

      {state === "recording" && (
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={stopRecording}
            disabled={disabled}
            className={cn(
              "h-20 w-20 rounded-full shadow-lg",
              "bg-gradient-to-br from-gray-500 to-gray-600",
              "hover:from-gray-600 hover:to-gray-700",
              "animate-pulse"
            )}
          >
            <div className="h-8 w-8 bg-white rounded-sm" />
          </Button>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{formatTime(recordingTime)}</div>
            <div className="text-sm text-muted-foreground">正在录音...</div>
          </div>
        </div>
      )}

      {/* 解析中状态 */}
      {state === "parsing" && (
        <div className="flex flex-col items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <div className="text-sm text-muted-foreground">录音解析中...</div>
        </div>
      )}

      {/* 解析成功状态 */}
      {state === "success" && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div className="text-sm text-green-600 font-medium">录音解析成功</div>

          {/* 音频播放器 */}
          {audioUrl && (
            <div className="w-full bg-card border border-border rounded-lg p-4">
              <audio ref={audioRef} src={audioUrl} controls className="w-full" />
            </div>
          )}

          {/* 解析结果 - 仅在提交后显示 */}
          {disabled && value?.text_answer && (
            <div className="w-full bg-muted/50 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">识别内容：</div>
              <div className="text-base">{value.text_answer}</div>
            </div>
          )}

          {/* 重新录音按钮 - 仅在未提交时显示 */}
          {!disabled && (
            <Button onClick={handleReRecord} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              重新录音
            </Button>
          )}
        </div>
      )}

      {/* 解析失败状态 */}
      {state === "failure" && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <div className="text-sm text-red-600 font-medium">录音解析失败</div>

          {/* 错误信息 */}
          {errorMessage && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-600">{errorMessage}</div>
            </div>
          )}

          {/* 重新录音按钮 - 仅在未提交时显示 */}
          {!disabled && (
            <Button onClick={handleReRecord} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              重新录音
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

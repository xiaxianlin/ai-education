/**
 * 口语题录音输入组件
 */
import { useRequest } from "ahooks";
import { toast } from "sonner";
import { studentApi } from "@/lib/api";
import { AudioRecorder } from "@/components/business/AudioRecorder";
import { usePageModel } from "../../models/PageModel";

export function AudioInput({ value, disabled, onChange }: AnswerFormProps) {
  const { session, question } = usePageModel();
  const { run: analyze, loading: analyzing } = useRequest(
    (data: Blob) => studentApi.audioAnswerAnalyze(session?.id || 0, question.id || 0, data),
    {
      manual: true,
      onSuccess: (res) => onChange({ ...value, ...res }),
      onError: (error) => toast.error(error.message),
    }
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <AudioRecorder onComplete={analyze} disabled={disabled || analyzing} maxDuration={10} />
      {value?.text && <div className="text-sm text-muted-foreground">录音已完成，解析结果：{value.text}</div>}
    </div>
  );
}

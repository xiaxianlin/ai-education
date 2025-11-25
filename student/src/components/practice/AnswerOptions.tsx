import { memo, useState, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioRecorder } from '@/components/ui/AudioRecorder';
import { toast } from 'sonner';
import type { Question } from '@/services/practice';

interface AnswerOptionsProps {
  question: Question;
  answer: string | undefined;
  hasAnswered: boolean;
  isCorrect: boolean | undefined;
  onAnswerChange: (answer: string, audioUrl?: string) => void;
}

function AnswerOptionsComponent({
  question,
  answer,
  hasAnswered,
  isCorrect,
  onAnswerChange,
}: AnswerOptionsProps) {
  let options: Array<string | { label: string; text: string }> = [];
  try {
    options = question.options ? JSON.parse(question.options) : [];
  } catch {
    options = question.options ? question.options.split('\n') : [];
  }

  if (question.type === '选择题') {
    return (
      <div className="flex flex-wrap gap-4">
        {options.map((option, index) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isSelected = answer === optionLabel;
          const optionText =
            typeof option === 'object' && option !== null && 'text' in option
              ? option.text
              : String(option);

          return (
            <button
              key={index}
              onClick={() => !hasAnswered && onAnswerChange(optionLabel)}
              disabled={hasAnswered}
              className={cn(
                'flex-1 min-w-[160px] flex items-center justify-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md',
                isSelected
                  ? hasAnswered
                    ? isCorrect
                      ? 'border-green-500 bg-green-500/10 text-green-500 shadow-green-500/20'
                      : 'border-destructive bg-destructive/10 text-destructive shadow-destructive/20'
                    : 'border-primary bg-primary/10 text-primary shadow-primary/20'
                  : 'border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground',
                hasAnswered && !isSelected && 'opacity-50 grayscale',
                hasAnswered && 'cursor-not-allowed'
              )}
            >
              <div className="text-xl font-bold text-center leading-relaxed flex-1">
                {optionText}
              </div>
              {isSelected && hasAnswered && (
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <CheckCircle className="h-7 w-7 text-green-500" />
                  ) : (
                    <XCircle className="h-7 w-7 text-destructive" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === '判断题') {
    return (
      <div className="space-y-4">
        {[
          { value: '正确', emoji: '✅' },
          { value: '错误', emoji: '❌' },
        ].map(({ value: option, emoji }) => {
          const isSelected = answer === option;
          return (
            <button
              key={option}
              onClick={() => !hasAnswered && onAnswerChange(option)}
              disabled={hasAnswered}
              className={cn(
                'w-full p-6 rounded-2xl border-2 transition-all duration-300 shadow-sm hover:shadow-md',
                isSelected
                  ? hasAnswered
                    ? isCorrect
                      ? 'border-green-500 bg-green-500/10 text-green-500'
                      : 'border-destructive bg-destructive/10 text-destructive'
                    : 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-card-foreground hover:border-primary/50 hover:bg-accent hover:text-accent-foreground',
                hasAnswered && 'cursor-not-allowed opacity-80'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-4xl">{emoji}</span>
                  {option}
                </span>
                {isSelected && hasAnswered && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // 口语题
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | undefined>(undefined);

  /**
   * 将 Blob 转换为 base64 字符串
   */
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // 移除 data URL 前缀，只保留 base64 数据
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    if (hasAnswered) {
      return;
    }

    try {
      setIsProcessing(true);
      // 将音频转换为 base64
      const base64Data = await blobToBase64(audioBlob);
      setAudioBase64(base64Data);
      // 口语题的答案通过 ASR 解析，这里传递 base64 数据
      // 实际的文本答案由后端 ASR 解析后返回
      onAnswerChange('', base64Data);
      toast.success('录音已完成，请点击提交按钮');
    } catch (error) {
      console.error('处理录音失败:', error);
      toast.error(error instanceof Error ? error.message : '处理录音失败');
    } finally {
      setIsProcessing(false);
    }
  }, [hasAnswered, onAnswerChange]);

  if (question.type === '口语题') {
    return (
      <div className="flex flex-col items-center gap-6">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={hasAnswered || isProcessing}
          maxDuration={60}
        />
        {audioBase64 && !hasAnswered && (
          <div className="text-sm text-muted-foreground">
            录音已完成，请点击提交按钮
          </div>
        )}
        {hasAnswered && (
          <div className="text-sm text-muted-foreground">
            答案已提交
          </div>
        )}
      </div>
    );
  }

  // 主观题、拼写题等
  const isSpellingQuestion = question.type === '拼写题';
  
  return (
    <div>
      <textarea
        value={answer || ''}
        onChange={(e) => !hasAnswered && onAnswerChange(e.target.value)}
        disabled={hasAnswered}
        placeholder="请输入你的答案..."
        className={cn(
          'w-full p-6 border-2 rounded-2xl resize-none focus:outline-none focus:ring-4 transition-all text-lg bg-card text-foreground placeholder:text-muted-foreground',
          hasAnswered
            ? isCorrect
              ? 'border-green-500 bg-green-500/10 text-green-500'
              : 'border-destructive bg-destructive/10 text-destructive'
            : 'border-input focus:border-primary focus:ring-primary/20',
          hasAnswered && 'cursor-not-allowed opacity-80'
        )}
        rows={isSpellingQuestion ? 2 : 6}
      />
    </div>
  );
}

export const AnswerOptions = memo(AnswerOptionsComponent);


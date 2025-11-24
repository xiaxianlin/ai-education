import { memo, useState, useCallback } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioRecorder } from '@/components/ui/AudioRecorder';
import { practiceApi } from '@/services/practice';
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
                'flex-1 min-w-[160px] flex items-center justify-center gap-4 p-6 rounded-2xl border-3 transition-all duration-300 shadow-lg hover:shadow-xl',
                isSelected
                  ? hasAnswered
                    ? isCorrect
                      ? 'border-green-400 bg-gradient-to-br from-green-100 via-emerald-50 to-green-50 scale-105 shadow-green-200/50'
                      : 'border-red-400 bg-gradient-to-br from-red-100 via-rose-50 to-red-50 scale-105 shadow-red-200/50'
                    : 'border-blue-400 bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-50 scale-105 shadow-blue-200/50'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50/30 hover:shadow-blue-100',
                hasAnswered && !isSelected && 'opacity-60',
                hasAnswered && 'cursor-not-allowed'
              )}
            >
              <div className="text-xl text-gray-800 font-bold text-center leading-relaxed flex-1">
                {optionText}
              </div>
              {isSelected && hasAnswered && (
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  ) : (
                    <XCircle className="h-7 w-7 text-red-600" />
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
                'w-full p-6 rounded-2xl border-3 transition-all duration-300 shadow-md hover:shadow-lg',
                isSelected
                  ? hasAnswered
                    ? isCorrect
                      ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 scale-105'
                      : 'border-red-500 bg-gradient-to-r from-red-50 to-rose-50 scale-105'
                    : 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 scale-105'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30',
                hasAnswered && 'cursor-not-allowed opacity-80'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="text-4xl">{emoji}</span>
                  {option}
                </span>
                {isSelected && hasAnswered && (
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
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
  const [isUploading, setIsUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);

  const handleRecordingComplete = useCallback(async (audioBlob: Blob) => {
    if (hasAnswered) {
      return;
    }

    try {
      setIsUploading(true);
      const result = await practiceApi.uploadAudio(audioBlob);
      setAudioUrl(result.audio_url);
      // 口语题的答案通过 ASR 解析，这里先传空字符串，实际答案由后端 ASR 解析后返回
      onAnswerChange('', result.audio_url);
      toast.success('录音上传成功，正在识别...');
    } catch (error) {
      console.error('上传录音失败:', error);
      toast.error(error instanceof Error ? error.message : '上传录音失败');
    } finally {
      setIsUploading(false);
    }
  }, [hasAnswered, onAnswerChange]);

  if (question.type === '口语题') {
    return (
      <div className="flex flex-col items-center gap-6">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          disabled={hasAnswered || isUploading}
          maxDuration={60}
        />
        {audioUrl && !hasAnswered && (
          <div className="text-sm text-gray-600">
            录音已上传，请点击提交按钮
          </div>
        )}
        {hasAnswered && (
          <div className="text-sm text-gray-600">
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
          'w-full p-6 border-3 rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all text-lg',
          hasAnswered
            ? isCorrect
              ? 'border-green-500 bg-green-50'
              : 'border-red-500 bg-red-50'
            : 'border-gray-300 focus:border-blue-400',
          hasAnswered && 'cursor-not-allowed'
        )}
        rows={isSpellingQuestion ? 2 : 6}
      />
    </div>
  );
}

export const AnswerOptions = memo(AnswerOptionsComponent);


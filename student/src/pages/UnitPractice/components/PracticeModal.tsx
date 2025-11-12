/**
 * 开始练习弹窗组件
 */
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PracticeModalProps {
  open: boolean;
  unitName: string;
  difficulty: string;
  questionCount: number;
  creating: boolean;
  onClose: () => void;
  onDifficultyChange: (difficulty: string) => void;
  onQuestionCountChange: (count: number) => void;
  onSubmit: () => void;
}

export const PracticeModal = memo(function PracticeModal({
  open,
  unitName,
  difficulty,
  questionCount: _questionCount,
  creating,
  onClose,
  onDifficultyChange,
  onQuestionCountChange: _onQuestionCountChange,
  onSubmit,
}: PracticeModalProps) {
  if (!open) return null;

  const difficultyOptions = [
    { value: 'easy', label: '简单 😊', emoji: '😊', color: 'border-green-300 bg-green-50 text-green-700' },
    { value: 'medium', label: '普通 😎', emoji: '😎', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
    { value: 'hard', label: '困难 😤', emoji: '😤', color: 'border-red-300 bg-red-50 text-red-700' },
    { value: 'adaptive', label: '自动 🤖', emoji: '🤖', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  ];


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">开始练习</h2>
              <p className="text-base text-gray-600">{unitName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-800 rounded-full w-10 h-10"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <div className="px-6 py-6 space-y-6">
          {/* 难度选择 */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-800">选难度</label>
            <div className="grid grid-cols-2 gap-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onDifficultyChange(option.value)}
                  className={cn(
                    'h-16 rounded-2xl border-2 font-bold text-base transition-all duration-200',
                    difficulty === option.value
                      ? option.color + ' scale-105 shadow-lg'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-14 text-lg rounded-2xl"
          >
            取消
          </Button>
          <Button
            onClick={onSubmit}
            disabled={creating}
            className="flex-1 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {creating ? '准备中...' : '开始 🚀'}
          </Button>
        </div>
      </div>
    </div>
  );
});


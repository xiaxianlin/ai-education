/**
 * 多选题输入组件
 */
import { cn } from '@/lib/utils';
import { Check, Square, CheckSquare } from 'lucide-react';
import type { InteractionInputProps } from '../types';

export function MultiChoiceInput({
  value,
  options = [],
  disabled,
  onChange,
}: InteractionInputProps) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  const toggleOption = (optionId: string) => {
    if (disabled) return;
    const newValues = selectedValues.includes(optionId)
      ? selectedValues.filter((v) => v !== optionId)
      : [...selectedValues, optionId];
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-2">（可多选）</p>
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.id);
        const letter = String.fromCharCode(65 + index);

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => toggleOption(option.id)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all',
              'text-left hover:shadow-md',
              disabled && 'cursor-not-allowed opacity-60',
              isSelected
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
            )}
          >
            {/* 复选框 */}
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                'transition-all',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {isSelected ? (
                <CheckSquare className="w-6 h-6" />
              ) : (
                <Square className="w-6 h-6" />
              )}
            </div>

            {/* 选项字母 */}
            <span className="font-bold text-lg w-6">{letter}.</span>

            {/* 选项内容 */}
            <div className="flex-1">
              {option.imageUrl && (
                <img
                  src={option.imageUrl}
                  alt={option.text || `选项 ${letter}`}
                  className="max-h-24 rounded-lg mb-2"
                />
              )}
              {option.text && (
                <span className="text-base">{option.text}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}


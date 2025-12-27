/**
 * 是非判断题输入组件
 */
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import type { InteractionInputProps } from '../types';

export function TrueFalseInput({
  value,
  disabled,
  onChange,
}: InteractionInputProps) {
  const selectedValue = Array.isArray(value) ? value[0] : value;

  const options = [
    { id: 'true', label: '正确', icon: Check, color: 'green' },
    { id: 'false', label: '错误', icon: X, color: 'red' },
  ];

  return (
    <div className="flex gap-4 justify-center">
      {options.map((option) => {
        const isSelected = selectedValue === option.id;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex-1 max-w-48 flex flex-col items-center gap-3 p-6 rounded-2xl border-3 transition-all',
              'hover:shadow-lg',
              disabled && 'cursor-not-allowed opacity-60',
              isSelected
                ? option.color === 'green'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-red-500 bg-red-50 shadow-lg'
                : 'border-border hover:border-primary/50'
            )}
          >
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                isSelected
                  ? option.color === 'green'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="w-8 h-8" />
            </div>
            <span
              className={cn(
                'text-lg font-bold',
                isSelected
                  ? option.color === 'green'
                    ? 'text-green-700'
                    : 'text-red-700'
                  : 'text-foreground'
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}


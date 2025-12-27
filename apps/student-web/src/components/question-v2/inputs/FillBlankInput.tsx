/**
 * 填空题输入组件
 * 支持多个填空位置
 */
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { InteractionInputProps } from '../types';

interface FillBlankInputProps extends InteractionInputProps {
  blanksCount?: number;
}

export function FillBlankInput({
  value,
  disabled,
  onChange,
  blanksCount = 1,
}: FillBlankInputProps) {
  const values = Array.isArray(value)
    ? value
    : value
    ? [value]
    : Array(blanksCount).fill('');

  const [localValues, setLocalValues] = useState<string[]>(values);

  useEffect(() => {
    setLocalValues(values);
  }, [value]);

  const handleChange = (index: number, newValue: string) => {
    const updated = [...localValues];
    updated[index] = newValue;
    setLocalValues(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: blanksCount }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground min-w-16">
            第 {index + 1} 空：
          </span>
          <input
            type="text"
            value={localValues[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            disabled={disabled}
            placeholder={`请填写答案`}
            className={cn(
              'flex-1 p-3 rounded-xl border-2 transition-all',
              'text-base',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              disabled && 'cursor-not-allowed opacity-60 bg-muted',
              'border-border hover:border-primary/50'
            )}
          />
        </div>
      ))}
    </div>
  );
}


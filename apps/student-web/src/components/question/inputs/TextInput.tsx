/**
 * 文本输入组件
 */
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { InteractionInputProps } from '../types';

export function TextInput({
  value,
  disabled,
  onChange,
}: InteractionInputProps) {
  const textValue = Array.isArray(value) ? value.join('') : value || '';
  const [localValue, setLocalValue] = useState(textValue);

  useEffect(() => {
    setLocalValue(textValue);
  }, [textValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <textarea
        value={localValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder="请输入你的答案..."
        className={cn(
          'w-full min-h-32 p-4 rounded-xl border-2 transition-all',
          'text-base resize-none',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
          disabled && 'cursor-not-allowed opacity-60 bg-muted',
          'border-border hover:border-primary/50'
        )}
      />
      <div className="text-right text-sm text-muted-foreground">
        已输入 {localValue.length} 字
      </div>
    </div>
  );
}


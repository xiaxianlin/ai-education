/**
 * 单选题输入组件
 */
import { Check } from 'lucide-react';
import type { InteractionInputProps } from '../types';

/**
 * 根据状态映射获取按钮的 className
 */
function getButtonClassName(params: {
  isSelected: boolean;
  disabled: boolean;
}): string {
  const base = 'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left hover:shadow-md';
  const classes: string[] = [base];
  
  if (params.disabled) {
    classes.push('cursor-not-allowed opacity-60');
  }
  
  if (params.isSelected) {
    classes.push('border-primary bg-primary/10 shadow-md');
  } else {
    classes.push('border-border hover:border-primary/50 hover:bg-primary/5');
  }
  
  return classes.join(' ');
}

/**
 * 根据状态映射获取选项字母容器的 className
 */
function getLetterClassName(params: {
  isSelected: boolean;
}): string {
  const base = 'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all';
  const classes: string[] = [base];
  
  if (params.isSelected) {
    classes.push('bg-primary text-primary-foreground');
  } else {
    classes.push('bg-muted text-muted-foreground');
  }
  
  return classes.join(' ');
}

export function SingleChoiceInput({
  value,
  options = [],
  disabled,
  onChange,
}: InteractionInputProps) {
  const selectedValue = Array.isArray(value) ? value[0] : value;

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedValue === option.id;
        const letter = String.fromCharCode(65 + index);

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={getButtonClassName({
              isSelected,
              disabled: !!disabled,
            })}
          >
            {/* 选项字母 */}
            <div
              className={getLetterClassName({
                isSelected,
              })}
            >
              {isSelected ? <Check className="w-5 h-5" /> : letter}
            </div>

            {/* 选项内容 */}
            <div className="flex-1">
              {option.image_url && (
                <img
                  src={option.image_url}
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


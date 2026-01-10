/**
 * 是非判断题输入组件
 */
import { Check, X } from 'lucide-react';
import type { InteractionInputProps } from '../types';

/**
 * 根据状态映射获取按钮的 className
 */
function getButtonClassName(params: {
  isSelected: boolean;
  isGreen: boolean;
  disabled: boolean;
}): string {
  const base = 'flex-1 max-w-48 flex flex-col items-center gap-3 p-6 rounded-2xl border-3 transition-all hover:shadow-lg';
  const classes: string[] = [base];
  
  if (params.disabled) {
    classes.push('cursor-not-allowed opacity-60');
  }
  
  if (params.isSelected) {
    if (params.isGreen) {
      classes.push('border-green-500 bg-green-50 shadow-lg');
    } else {
      classes.push('border-red-500 bg-red-50 shadow-lg');
    }
  } else {
    classes.push('border-border hover:border-primary/50');
  }
  
  return classes.join(' ');
}

/**
 * 根据状态映射获取图标容器的 className
 */
function getIconClassName(params: {
  isSelected: boolean;
  isGreen: boolean;
}): string {
  const base = 'w-16 h-16 rounded-full flex items-center justify-center transition-all';
  const classes: string[] = [base];
  
  if (params.isSelected) {
    if (params.isGreen) {
      classes.push('bg-green-500 text-white');
    } else {
      classes.push('bg-red-500 text-white');
    }
  } else {
    classes.push('bg-muted text-muted-foreground');
  }
  
  return classes.join(' ');
}

/**
 * 根据状态映射获取文本的 className
 */
function getTextClassName(params: {
  isSelected: boolean;
  isGreen: boolean;
}): string {
  const base = 'text-lg font-bold';
  const classes: string[] = [base];
  
  if (params.isSelected) {
    if (params.isGreen) {
      classes.push('text-green-700');
    } else {
      classes.push('text-red-700');
    }
  } else {
    classes.push('text-foreground');
  }
  
  return classes.join(' ');
}

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
        const isSelected = !!selectedValue && selectedValue === option.id;
        const isGreen = option.color === 'green';
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            className={getButtonClassName({
              isSelected,
              isGreen,
              disabled: !!disabled,
            })}
          >
            <div
              className={getIconClassName({
                isSelected,
                isGreen,
              })}
            >
              <Icon className="w-8 h-8" />
            </div>
            <span
              className={getTextClassName({
                isSelected,
                isGreen,
              })}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}


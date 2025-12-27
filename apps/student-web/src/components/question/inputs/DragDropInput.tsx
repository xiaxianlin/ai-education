import { cn } from "@/lib/utils";
import type { InteractionInputProps } from "../types";

/**
 * 拖拽交互组件
 */
export function DragDropInput({ value, options = [], disabled, onChange }: InteractionInputProps) {
  // 确保 value 是数组格式
  const selectedIds = Array.isArray(value) ? value : value ? [value] : [];

  // 这里的实现是一个通用的拖拽选择器
  // items 用于渲染可拖拽的项
  // 如果是分类题，可能需要更复杂的结构，但作为通用组件，我们先实现基础的“点击/拖拽到目标区”逻辑

  const handleToggle = (id: string) => {
    if (disabled) return;

    let newValue: string[];
    if (selectedIds.includes(id)) {
      newValue = selectedIds.filter((v) => v !== id);
    } else {
      newValue = [...selectedIds, id];
    }
    onChange(newValue);
  };

  // 为了模拟拖拽效果但在没库的情况下保持高可用性，我们使用“点击选中”并配合精美的动画效果
  // 这种交互在移动端（学生端 App）通常比原生 Drag & Drop 体验更好

  return (
    <div className="space-y-6">
      {/* 待选区 (Pool) */}
      <div className="bg-muted/30 p-4 rounded-2xl border-2 border-dashed border-border">
        <div className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">待选项</div>
        <div className="flex flex-wrap gap-3">
          {options.map((option) => {
            const isSelected = selectedIds.includes(option.id);
            if (isSelected) return null;

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => handleToggle(option.id)}
                className={cn(
                  "px-4 py-2 bg-background rounded-xl border-2 border-border shadow-sm",
                  "hover:border-primary hover:shadow-md transition-all active:scale-95",
                  "flex items-center gap-2",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {option.imageUrl && <img src={option.imageUrl} alt="" className="w-6 h-6 rounded-md object-cover" />}
                <span>{option.text}</span>
              </button>
            );
          })}
          {options.every((opt) => selectedIds.includes(opt.id)) && (
            <div className="text-sm text-muted-foreground italic py-2">所有选项已放置</div>
          )}
        </div>
      </div>

      {/* 放入区 (Target) */}
      <div className="bg-primary/5 p-4 rounded-2xl border-2 border-primary/20 min-h-[100px]">
        <div className="text-xs text-primary/60 mb-3 font-medium uppercase tracking-wider">已放入</div>
        <div className="flex flex-wrap gap-3">
          {selectedIds.map((id) => {
            const option = options.find((opt) => opt.id === id);
            if (!option) return null;

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => handleToggle(option.id)}
                className={cn(
                  "px-4 py-2 bg-primary text-primary-foreground rounded-xl shadow-md",
                  "hover:bg-primary/90 transition-all active:scale-95",
                  "flex items-center gap-2 animate-in zoom-in-50 duration-200",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {option.imageUrl && (
                  <img src={option.imageUrl} alt="" className="w-6 h-6 rounded-md object-cover brightness-110" />
                )}
                <span>{option.text}</span>
                {!disabled && <span className="ml-1 opacity-60 text-xs">×</span>}
              </button>
            );
          })}
          {selectedIds.length === 0 && (
            <div className="w-full h-12 flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-primary/10 rounded-xl">
              点击上方选项放入此处
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

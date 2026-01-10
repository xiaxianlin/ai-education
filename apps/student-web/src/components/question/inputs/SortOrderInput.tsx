import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import type { InteractionInputProps } from "../types";

/**
 * 排序交互组件
 * 采用“点击排序”模式：从候选池点击选项进入排序序列
 */
export function SortOrderInput({ value, options = [], disabled, onChange }: InteractionInputProps) {
  const sortedIds = Array.isArray(value) ? value : [];

  const handleAdd = (id: string) => {
    if (disabled || sortedIds.includes(id)) return;
    onChange([...sortedIds, id]);
  };

  const handleRemove = (id: string) => {
    if (disabled) return;
    onChange(sortedIds.filter((v) => v !== id));
  };

  const moveUp = (index: number) => {
    if (disabled || index === 0) return;
    const newItems = [...sortedIds];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    onChange(newItems);
  };

  const moveDown = (index: number) => {
    if (disabled || index === sortedIds.length - 1) return;
    const newItems = [...sortedIds];
    [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
    onChange(newItems);
  };

  return (
    <div className="space-y-8">
      {/* 排序结果区 */}
      <div className="bg-primary/5 p-6 rounded-2xl border-2 border-primary/20 min-h-[120px]">
        <div className="text-xs text-primary/60 mb-4 font-bold uppercase tracking-widest flex justify-between items-center">
          <span>
            排序结果 ({sortedIds.length}/{options.length})
          </span>
          {sortedIds.length > 0 && !disabled && (
            <button onClick={() => onChange([])} className="hover:text-primary transition-colors">
              重置
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {sortedIds.map((id, index) => {
            const option = options.find((opt) => opt.id === id);
            if (!option) return null;

            return (
              <div
                key={option.id}
                className={cn(
                  "flex items-center gap-4 p-3 bg-background rounded-xl border-2 border-primary/30 shadow-sm",
                  "animate-in slide-in-from-left-4 duration-300"
                )}
              >
                {/* 序号 */}
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>

                {/* 内容 */}
                <div className="flex-1 text-base font-medium">{option.text}</div>

                {/* 控制按钮 */}
                {!disabled && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-30 transition-colors"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === sortedIds.length - 1}
                      className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-30 transition-colors"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(id)}
                      className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors ml-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {sortedIds.length === 0 && (
            <div className="h-16 flex items-center justify-center text-sm text-muted-foreground italic border-2 border-dashed border-primary/10 rounded-xl">
              请从下方选项中按顺序点击进行排序
            </div>
          )}
        </div>
      </div>

      {/* 待选池 */}
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">待选选项</div>
        <div className="flex flex-wrap gap-3">
          {options.map((option) => {
            const isSelected = sortedIds.includes(option.id);

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled || isSelected}
                onClick={() => handleAdd(option.id)}
                className={getOptionButtonClassName({
                  isSelected,
                  disabled: !!(disabled || isSelected),
                })}
              >
                {option.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

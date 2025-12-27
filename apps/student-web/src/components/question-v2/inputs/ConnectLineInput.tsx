import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { InteractionInputProps } from "../types";

/**
 * 连线交互组件
 */
export function ConnectLineInput({ value, options = [], disabled, onChange }: InteractionInputProps) {
  // 连线数据结构：['A1-B2', 'A2-B1'] 这种格式，或者直接存对象
  const connections = Array.isArray(value) ? value : [];
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 假设 options 被分成左右两部分
  // 在实际 V2 结构中，可能通过 interactionConfig 指定如何划分
  // 这里简化处理：前一半是左侧，后一半是右侧；或者根据 option 的特定属性
  const halfLength = Math.ceil(options.length / 2);
  const leftOptions = options.slice(0, halfLength);
  const rightOptions = options.slice(halfLength);

  const handleLeftClick = (id: string) => {
    if (disabled) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (rightId: string) => {
    if (disabled || !selectedLeft) return;

    // 创建或切换连线
    const connectionKey = `${selectedLeft}-${rightId}`;
    let newConnections: string[];

    if (connections.includes(connectionKey)) {
      newConnections = connections.filter((c) => c !== connectionKey);
    } else {
      // 如果左侧已经连过了，先移除旧连线（一对一逻辑）
      newConnections = connections.filter((c) => !c.startsWith(`${selectedLeft}-`));
      // 如果右侧已经连过了，也移除旧连线
      newConnections = newConnections.filter((c) => !c.endsWith(`-${rightId}`));
      newConnections.push(connectionKey);
    }

    onChange(newConnections);
    setSelectedLeft(null); // 连线后清除左侧选中状态
  };

  // 连线渲染逻辑（SVG）
  // 我们需要获取每个选项元素的中心坐标
  const [coords, setCoords] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    const updateCoords = () => {
      if (!containerRef.current) return;
      const newCoords: Record<string, { x: number; y: number }> = {};
      const containerRect = containerRef.current.getBoundingClientRect();

      options.forEach((opt) => {
        const el = document.getElementById(`connect-${opt.id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          newCoords[opt.id] = {
            x: rect.left + rect.width / 2 - containerRect.left,
            y: rect.top + rect.height / 2 - containerRect.top,
          };
        }
      });
      setCoords(newCoords);
    };

    updateCoords();
    window.addEventListener("resize", updateCoords);
    return () => window.removeEventListener("resize", updateCoords);
  }, [options]);

  return (
    <div ref={containerRef} className="relative grid grid-cols-2 gap-20 p-4 min-h-[300px]">
      {/* 连线层 (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {connections.map((conn) => {
          const [leftId, rightId] = conn.split("-");
          const start = coords[leftId];
          const end = coords[rightId];
          if (!start || !end) return null;

          return (
            <line
              key={conn}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="var(--primary)"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-in fade-in duration-300"
              style={{ filter: "drop-shadow(0 0 4px rgba(var(--primary-rgb), 0.3))" }}
            />
          );
        })}
        {/* 正在连接的临时线 */}
        {selectedLeft &&
          containerRef.current &&
          /* 这里可以实现跟随鼠标的线，但由于是 React，我们先保持简洁 */
          null}
      </svg>

      {/* 左侧选项 */}
      <div className="space-y-4 z-10">
        {leftOptions.map((option) => {
          const isSelected = selectedLeft === option.id;
          const isConnected = connections.some((c) => c.startsWith(`${option.id}-`));

          return (
            <button
              key={option.id}
              id={`connect-${option.id}`}
              type="button"
              disabled={disabled}
              onClick={() => handleLeftClick(option.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-center relative font-medium shadow-sm",
                isSelected
                  ? "border-primary bg-primary/10 scale-105 z-20"
                  : "border-border bg-background hover:border-primary/50",
                isConnected && !isSelected && "border-primary/30",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {option.text}
              {isConnected && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
              )}
            </button>
          );
        })}
      </div>

      {/* 右侧选项 */}
      <div className="space-y-4 z-10">
        {rightOptions.map((option) => {
          const isConnected = connections.some((c) => c.endsWith(`-${option.id}`));

          return (
            <button
              key={option.id}
              id={`connect-${option.id}`}
              type="button"
              disabled={disabled || !selectedLeft}
              onClick={() => handleRightClick(option.id)}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-center relative font-medium shadow-sm",
                isConnected ? "border-primary bg-primary/10" : "border-border bg-background",
                selectedLeft && !isConnected && "hover:border-primary ring-2 ring-primary/20 animate-pulse",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {option.text}
              {isConnected && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

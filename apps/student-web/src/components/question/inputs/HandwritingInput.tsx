import { cn } from "@/lib/utils";
import { Eraser, MousePointer2, Trash2, Undo2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type { InteractionInputProps } from "../types";

/**
 * 手写输入组件
 */
export function HandwritingInput({ value, disabled, onChange }: InteractionInputProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(!!value);
  const [history, setHistory] = useState<string[]>([]);

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置画布尺寸
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 设置绘图样式
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "var(--foreground)";
    ctx.lineWidth = 3;

    // 如果有初始值，加载它
    if (value && typeof value === "string") {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setHasContent(true);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // 保存历史记录
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      setHistory((prev) => [...prev.slice(-9), dataUrl]); // 最多保留10步
      onChange(dataUrl);
    }
  };

  const clear = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasContent(false);
      setHistory([]);
      onChange("");
    }
  };

  const undo = () => {
    if (disabled || history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // 移除当前
    const lastState = newHistory[newHistory.length - 1];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (lastState) {
      const img = new Image();
      img.onload = () =>
        ctx.drawImage(img, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      img.src = lastState;
      onChange(lastState);
    } else {
      setHasContent(false);
      onChange("");
    }
    setHistory(newHistory);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <MousePointer2 className="w-4 h-4" />
          <span>请在下方区域手写您的答案</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={disabled || history.length === 0}
            className="p-2 hover:bg-muted rounded-lg disabled:opacity-30 transition-colors"
            title="撤销"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={clear}
            disabled={disabled || !hasContent}
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg disabled:opacity-30 transition-colors"
            title="清除"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative bg-background border-2 border-border rounded-2xl overflow-hidden cursor-crosshair shadow-inner",
          "min-h-[240px] touch-none",
          disabled && "opacity-60 cursor-not-allowed bg-muted/30"
        )}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full min-h-[240px]"
        />

        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <span className="text-4xl font-bold tracking-widest uppercase">手写区</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Eraser className="w-3 h-3" />
        <span>如果是错题，可以随时点击清除重新录入</span>
      </div>
    </div>
  );
}

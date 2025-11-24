/**
 * 盖章动画组件
 * 用于显示回答正确/错误的盖章效果
 */
import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface StampAnimationProps {
  isCorrect: boolean;
  show: boolean;
}

export const StampAnimation = memo(function StampAnimation({
  isCorrect,
  show,
}: StampAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsAnimating(true);
      // 动画持续时间约 0.6 秒
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute z-10',
        'flex items-end justify-end',
        'pointer-events-none',
        'p-4'
      )}
      style={{
        bottom: 0,
        right: 0,
        animation: isAnimating ? 'stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}
    >
      <div
        className={cn(
          'relative flex flex-col items-center justify-center',
          'w-[72px] h-[72px] rounded-full',
          'shadow-md',
          isCorrect 
            ? 'bg-green-100' 
            : 'bg-red-100'
        )}
      >
        <span className="text-2xl mb-0.5">
          {isCorrect ? '✅' : '❌'}
        </span>
        <span
          className={cn(
            'text-[10px] font-semibold leading-tight text-center px-1',
            isCorrect ? 'text-green-700' : 'text-red-700'
          )}
        >
          {isCorrect ? '回答正确' : '回答错误'}
        </span>
      </div>
      <style>{`
        @keyframes stamp {
          0% {
            transform: scale(0) rotate(12deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.15) rotate(-5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
});


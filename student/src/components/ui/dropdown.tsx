import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] rounded-md border bg-white shadow-lg',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function DropdownItem({ children, onClick, className, disabled }: DropdownItemProps) {
  return (
    <div
      className={cn(
        'px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );
}

interface DropdownSeparatorProps {
  className?: string;
}

export function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return <div className={cn('h-px bg-gray-200 my-1', className)} />;
}


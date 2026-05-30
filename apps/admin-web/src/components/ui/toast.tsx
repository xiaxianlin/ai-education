import { createRoot } from 'react-dom/client';
import { CheckCircle, Info, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { classNames } from './index';

type ToastType = 'success' | 'error' | 'info' | 'loading';

type ToastItem = {
  id: string;
  type: ToastType;
  content: string;
  duration?: number;
};

const listeners = new Set<(items: ToastItem[]) => void>();
let items: ToastItem[] = [];
let mounted = false;

const iconMap = {
  success: <CheckCircle className="size-4 text-emerald-500" />,
  error: <XCircle className="size-4 text-destructive" />,
  info: <Info className="size-4 text-primary" />,
  loading: <Loader2 className="size-4 animate-spin text-primary" />,
};

function emit() {
  listeners.forEach((listener) => listener(items));
}

function ensureHost() {
  if (mounted || typeof document === 'undefined') {
    return;
  }

  const host = document.createElement('div');
  host.id = 'app-toast-root';
  document.body.appendChild(host);
  createRoot(host).render(<ToastViewport />);
  mounted = true;
}

function upsertToast(input: Omit<ToastItem, 'id'> & { key?: string }) {
  ensureHost();
  const id = input.key || `${Date.now()}-${Math.random()}`;
  const next: ToastItem = { id, type: input.type, content: input.content, duration: input.duration };
  items = items.filter((item) => item.id !== id).concat(next);
  emit();

  if (next.type !== 'loading') {
    window.setTimeout(() => {
      toast.destroy(id);
    }, next.duration ?? 2400);
  }

  return id;
}

export const toast = {
  success: (content: string, key?: string) => upsertToast({ type: 'success', content, key }),
  error: (content: string, key?: string) => upsertToast({ type: 'error', content, key }),
  info: (content: string, key?: string) => upsertToast({ type: 'info', content, key }),
  loading: ({ content, key }: { content: string; key?: string; duration?: number }) => upsertToast({ type: 'loading', content, key }),
  destroy: (id?: string) => {
    items = id ? items.filter((item) => item.id !== id) : [];
    emit();
  },
};

function ToastViewport() {
  const [visibleItems, setVisibleItems] = useState(items);

  useEffect(() => {
    listeners.add(setVisibleItems);
    return () => {
      listeners.delete(setVisibleItems);
    };
  }, []);

  return (
    <div className="fixed right-4 top-4 z-[100] grid w-[calc(100vw-2rem)] max-w-sm gap-2">
      {visibleItems.map((item) => (
        <div
          key={item.id}
          className={classNames(
            'flex items-start gap-2 rounded-lg border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg',
            item.type === 'error' && 'border-destructive/30',
          )}
        >
          {iconMap[item.type]}
          <span>{item.content}</span>
        </div>
      ))}
    </div>
  );
}

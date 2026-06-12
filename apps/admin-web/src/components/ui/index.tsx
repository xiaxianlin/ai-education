import { ChevronDown, Loader2, Star } from 'lucide-react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';

type ClassValue = string | false | null | undefined;

export function classNames(...values: ClassValue[]) {
  return values.filter(Boolean).join(' ');
}

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'icon';

const buttonVariantClass: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  link: 'h-auto px-0 text-primary underline-offset-4 hover:underline',
};

const buttonSizeClass: Record<ButtonSize, string> = {
  xs: 'h-7 rounded-md px-2 text-xs',
  sm: 'h-8 rounded-md px-3 text-xs',
  md: 'h-9 rounded-md px-4 py-2',
  lg: 'h-10 rounded-md px-6',
  icon: 'h-9 w-9 rounded-md p-0',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({
  className,
  variant = 'default',
  size = 'md',
  icon,
  loading,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classNames(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        buttonVariantClass[variant],
        buttonSizeClass[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function IconButton({ className, ...props }: ButtonProps) {
  return <Button size="icon" variant="ghost" className={className} {...props} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={classNames('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)}>
      {children}
    </section>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={classNames('flex flex-col gap-1.5 border-b border-border px-5 py-4', className)}>{children}</div>;
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h3 className={classNames('text-base font-semibold leading-none tracking-normal', className)}>{children}</h3>;
}

export function CardDescription({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={classNames('text-sm text-muted-foreground', className)}>{children}</p>;
}

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={classNames('p-5', className)}>{children}</div>;
}

export type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';

const badgeVariantClass: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  destructive: 'bg-destructive/10 text-destructive',
  outline: 'border border-border text-foreground',
};

export function Badge({
  className,
  variant = 'secondary',
  children,
}: {
  className?: string;
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <span className={classNames('inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium', badgeVariantClass[variant], className)}>
      {children}
    </span>
  );
}

export function Spinner({ label = '加载中...' }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({ title = '暂无数据', description }: { title?: string; description?: string }) {
  return (
    <div className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
    </div>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={classNames(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={classNames(
        'min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select
        className={classNames(
          'flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  );
}

export function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-foreground">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={classNames(
        'relative h-5 w-9 rounded-full border border-transparent transition-colors disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-input',
      )}
    >
      <span
        className={classNames(
          'absolute top-0.5 size-4 rounded-full bg-background shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

export function Rating({
  value = 0,
  onChange,
  max = 5,
}: {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const nextValue = index + 1;
        return (
          <button key={nextValue} type="button" onClick={() => onChange?.(nextValue)} className="text-amber-500">
            <Star className={classNames('size-5', nextValue <= value ? 'fill-current' : '')} />
          </button>
        );
      })}
    </div>
  );
}

export type DataTableColumn<T> = {
  key: string;
  title: ReactNode;
  width?: string;
  className?: string;
  render?: (record: T, index: number) => ReactNode;
};

export type TableActionRef = {
  reload: () => void;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  emptyText,
}: {
  columns: DataTableColumn<T>[];
  data?: T[];
  rowKey: keyof T | ((record: T) => string | number);
  loading?: boolean;
  emptyText?: string;
}) {
  const rows = data || [];
  const orderedColumns = [
    ...columns.filter((column) => column.key !== 'actions'),
    ...columns.filter((column) => column.key === 'actions'),
  ];
  const getKey = (record: T) => (typeof rowKey === 'function' ? rowKey(record) : String(record[rowKey]));

  if (loading) {
    return <Spinner />;
  }

  if (!rows.length) {
    return <EmptyState title={emptyText || '暂无数据'} />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              {orderedColumns.map((column) => {
                const isActionColumn = column.key === 'actions';
                return (
                <th
                  key={column.key}
                  style={{ width: isActionColumn ? '1%' : column.width }}
                  className={classNames(
                    'px-3 py-2 text-left font-medium',
                    isActionColumn && 'whitespace-nowrap',
                    column.className,
                  )}
                >
                  {column.title}
                </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((record, index) => (
              <tr key={getKey(record)} className="border-t border-border transition-colors hover:bg-muted/40">
                {orderedColumns.map((column) => {
                  const isActionColumn = column.key === 'actions';
                  return (
                  <td
                    key={column.key}
                    className={classNames('px-3 py-2 align-middle', isActionColumn && 'whitespace-nowrap', column.className)}
                  >
                    {column.render?.(record, index) ?? String((record as Record<string, unknown>)[column.key] ?? '-')}
                  </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? <h1 className="truncate text-2xl font-semibold tracking-normal text-foreground">{title}</h1> : null}
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
      {children}
    </main>
  );
}

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: {
  open?: boolean;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 grid w-full max-w-xl gap-4 rounded-lg border border-border bg-card p-6 shadow-lg">
        <div>
          <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {children}
        {footer ? <div className="flex justify-end gap-2 border-t border-border pt-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

export function DescriptionList({
  items,
}: {
  items: Array<{ label: ReactNode; value: ReactNode }>;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
        <div key={index} className="rounded-md border border-border bg-muted/20 p-3">
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-sm text-foreground">{item.value ?? '-'}</dd>
        </div>
      ))}
    </dl>
  );
}

import { Button, type ButtonProps } from '@/components/ui';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonProps?: ButtonProps;
}

export function DeleteButton({
  onConfirm,
  title = '确定要删除吗？',
  description = '删除后无法恢复，请谨慎操作。',
  buttonText = '删除',
  buttonProps,
}: DeleteButtonProps) {
  const handleClick = () => {
    if (window.confirm(`${title}\n${description}`)) {
      onConfirm();
    }
  };

  return (
    <Button variant="link" className="text-destructive" icon={<Trash2 className="size-4" />} onClick={handleClick} {...buttonProps}>
      {buttonText}
    </Button>
  );
}

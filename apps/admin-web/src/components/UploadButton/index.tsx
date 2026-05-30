import { Button, type ButtonProps } from '@/components/ui';
import { Upload } from 'lucide-react';
import type { ChangeEvent, FC } from 'react';

interface UploadButtonProps extends Omit<ButtonProps, 'onChange'> {
  action: (data: FormData) => void;
  onSuccess?: () => void;
}

export const UploadButton: FC<UploadButtonProps> = ({ action, onSuccess, children, ...props }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    action(formData);
    onSuccess?.();
    event.target.value = '';
  };

  return (
    <label className="inline-flex">
      <input type="file" className="sr-only" onChange={handleChange} />
      <Button icon={<Upload className="size-4" />} {...props}>
        {children || '上传'}
      </Button>
    </label>
  );
};

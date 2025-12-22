import { FC } from 'react';
import { Button, ButtonProps, Upload } from 'antd';

interface UploadButtonProps extends ButtonProps {
  action: (data: FormData) => void;
  onSuccess?: () => void;
}
export const UploadButton: FC<UploadButtonProps> = ({ action, onSuccess, ...props }) => {
  return (
    <Upload
      fileList={[]}
      beforeUpload={(file) => {
        const formData = new FormData();
        formData.append('file', file);
        action(formData);
        return false;
      }}
    >
      <Button {...props} />
    </Upload>
  );
};

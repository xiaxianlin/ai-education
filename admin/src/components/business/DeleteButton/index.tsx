import { Button, Popconfirm, PopconfirmProps } from 'antd';
import { ButtonProps } from 'antd/es/button';

interface DeleteButtonProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonProps?: ButtonProps;
  popconfirmProps?: Omit<PopconfirmProps, 'onConfirm' | 'title' | 'description'>;
}

/**
 * 通用删除按钮组件
 * 封装了 Popconfirm 和 Button
 */
export function DeleteButton({
  onConfirm,
  title = '确定要删除吗？',
  description = '删除后无法恢复，请谨慎操作。',
  buttonText = '删除',
  buttonProps,
  popconfirmProps,
}: DeleteButtonProps) {
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ danger: true }}
      {...popconfirmProps}
    >
      <Button type="link" danger size="small" {...buttonProps}>
        {buttonText}
      </Button>
    </Popconfirm>
  );
}

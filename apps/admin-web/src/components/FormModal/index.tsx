import { ModalForm, ModalFormProps } from '@ant-design/pro-components';
import { FormInstance } from 'antd';
import { ReactNode } from 'react';

export interface FormModalProps<T> extends Omit<ModalFormProps<T>, 'modalProps' | 'children'> {
  form: FormInstance<T>;
  open: boolean;
  onCancel: () => void;
  isEdit?: boolean;
  addTitle?: string;
  editTitle?: string;
  children?: ReactNode;
}

/**
 * 通用表单弹窗组件
 * 封装了常用的 ModalForm 配置
 */
export function FormModal<T = Record<string, any>>({
  form,
  open,
  onCancel,
  isEdit = false,
  addTitle = '新增',
  editTitle = '编辑',
  width = 500,
  layout = 'horizontal',
  labelAlign = 'left',
  labelCol = { span: 4 },
  children,
  ...props
}: FormModalProps<T>) {
  return (
    <ModalForm<T>
      form={form}
      open={open}
      title={isEdit ? editTitle : addTitle}
      width={width}
      layout={layout}
      labelAlign={labelAlign}
      labelCol={labelCol}
      modalProps={{
        destroyOnClose: true,
        onCancel,
      }}
      {...props}
    >
      <div className="pt-3" />
      {children}
    </ModalForm>
  );
}

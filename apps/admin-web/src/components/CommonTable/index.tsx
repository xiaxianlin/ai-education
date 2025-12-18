import { ProTable, ProTableProps } from '@ant-design/pro-components';

interface CommonTableProps<T, U extends Record<string, any>>
  extends Omit<ProTableProps<T, U>, 'bordered' | 'scroll' | 'options' | 'toolbar'> {
  enableSettings?: boolean;
}

export function CommonTable<
  T extends Record<string, any>,
  U extends Record<string, any> = Record<string, any>,
>({
  enableSettings = false,
  ...props
}: CommonTableProps<T, U>) {
  return (
    <ProTable<T, U>
      bordered
      scroll={{ x: 'max-content' }}
      options={false}
      toolbar={enableSettings ? undefined : { settings: [] }}
      {...props}
    />
  );
}

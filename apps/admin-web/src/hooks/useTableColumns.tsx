import { StatusTag } from '@/components';
import { classNames } from '@/components/ui';
import { formatDateTime } from '@ai-education/shared-web';
import type { ReactNode } from 'react';

export type TableColumn<T> = {
  title: ReactNode;
  dataIndex?: keyof T | string | string[];
  key?: string;
  width?: number | string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  renderText?: (value: unknown, record: T, index: number) => ReactNode;
  hideInSearch?: boolean;
  hideInTable?: boolean;
  valueType?: string;
  valueEnum?: Record<string | number, unknown>;
  fixed?: string;
  className?: string;
};

function readValue<T>(record: T, dataIndex?: keyof T | string | string[]) {
  if (!dataIndex) {
    return undefined;
  }
  const path = Array.isArray(dataIndex) ? dataIndex : [String(dataIndex)];
  return path.reduce<unknown>((value, key) => {
    if (value && typeof value === 'object') {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, record as Record<string, unknown>);
}

export function renderColumnValue<T>(column: TableColumn<T>, record: T, index: number) {
  const value = readValue(record, column.dataIndex);
  if (column.render) {
    return column.render(value, record, index);
  }
  if (column.renderText) {
    return column.renderText(value, record, index);
  }
  return value == null || value === '' ? '-' : String(value);
}

export function createTimeColumn<T>(
  title: string,
  dataIndex: string | string[],
  options?: Partial<TableColumn<T>>,
): TableColumn<T> {
  return {
    title,
    dataIndex,
    width: 170,
    renderText: (time) => (typeof time === 'number' ? formatDateTime(time) : '-'),
    ...options,
  };
}

export function createStatusColumn<T>(
  title: string = '状态',
  dataIndex: string | string[] = 'status',
  options?: Partial<TableColumn<T>>,
): TableColumn<T> {
  return {
    title,
    dataIndex,
    width: 80,
    render: (status) => <StatusTag status={status === 1} />,
    ...options,
  };
}

export function createStatusSearchColumn<T>(
  title: string = '状态',
  dataIndex: string | string[] = 'status',
  options?: Partial<TableColumn<T>>,
): TableColumn<T> {
  return {
    title,
    dataIndex,
    valueType: 'select',
    valueEnum: {
      1: { text: '启用', status: 'Success' },
      0: { text: '停用', status: 'Error' },
    },
    hideInTable: true,
    ...options,
  };
}

export function createActionColumn<T>(
  render: (record: T) => ReactNode,
  options?: Partial<TableColumn<T>>,
): TableColumn<T> {
  return {
    title: '操作',
    width: 80,
    ...options,
    render: (_, record) => <div className={classNames('flex flex-wrap items-center gap-2')}>{render(record)}</div>,
  };
}

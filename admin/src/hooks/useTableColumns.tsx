import { ProColumns } from '@ant-design/pro-components';
import { fmtTime } from '@/utils/time';
import { StatusTag } from '@/components/ui';

/**
 * 通用的时间列配置
 */
export function createTimeColumn<T>(
  title: string,
  dataIndex: string,
  options?: Partial<ProColumns<T>>,
): ProColumns<T> {
  return {
    title,
    dataIndex,
    hideInSearch: true,
    width: 170,
    renderText: (time) => (time ? fmtTime(time) : '-'),
    ...options,
  };
}

/**
 * 通用的状态列配置
 */
export function createStatusColumn<T>(
  title: string = '状态',
  dataIndex: string = 'status',
  options?: Partial<ProColumns<T>>,
): ProColumns<T> {
  return {
    title,
    dataIndex,
    hideInSearch: true,
    width: 80,
    render: (status) => <StatusTag status={status === 1} />,
    ...options,
  };
}

/**
 * 通用的状态搜索列配置
 */
export function createStatusSearchColumn<T>(
  title: string = '状态',
  dataIndex: string = 'status',
  options?: Partial<ProColumns<T>>,
): ProColumns<T> {
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

/**
 * 通用的操作列配置
 */
export function createActionColumn<T>(
  render: ProColumns<T>['render'],
  options?: Partial<ProColumns<T>>,
): ProColumns<T> {
  return {
    title: '操作',
    valueType: 'option',
    fixed: 'right',
    width: 80,
    render,
    ...options,
  };
}

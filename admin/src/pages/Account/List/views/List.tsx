import { Button, Flex, Input, Space, Table, type TableProps } from 'antd';
import { fmtTime } from '@/utils/time';
import { ACCOUNT_TYPE_MAP, AccountType } from '../../constants';
import { StatusButton } from '../compnents/StatusButton';
import { useAccountListModel } from '../models/page';
import { DeleteButton } from '../compnents/DeleteButton';
import { useModel } from '@umijs/max';
type ColumnsType<T extends object = object> = TableProps<T>['columns'];

export default function ListView() {
  const { initialState } = useModel('@@initialState');
  const {
    state: { params, loading, accounts, total },
    show,
    search,
    refresh,
    handleTableChange,
  } = useAccountListModel();

  const columns: ColumnsType<Account> = [
    {
      title: '账号',
      dataIndex: 'username',
    },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type: AccountType) => ACCOUNT_TYPE_MAP[type],
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (status ? '启用' : '禁用'),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 150,
      render: (time) => fmtTime(time),
    },
    {
      title: '操作',
      dataIndex: 'id',
      render: (_, record) => {
        if (record.type === AccountType.Init) {
          return <></>;
        }
        if (record.username === initialState?.user?.username) {
          return <></>;
        }
        return (
          <Space>
            <StatusButton record={record} onChange={refresh} />
            <DeleteButton record={record} onChange={refresh} />
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Flex className="mb-3" justify="space-between">
        <Input.Search className="w-96" placeholder="请输入关键字搜索" onSearch={(value) => search(value)} />
        <Button type="primary" onClick={show}>
          创建账号
        </Button>
      </Flex>
      <Table<Account>
        bordered
        size="small"
        rowKey="id"
        columns={columns}
        loading={loading}
        dataSource={accounts}
        pagination={{ current: params.page_num, pageSize: params.page_size, total }}
        onChange={handleTableChange}
      />
    </>
  );
}

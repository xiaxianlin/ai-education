import { createAccount, searchAccount } from '@/services/account';
import { useBoolean, useRequest } from 'ahooks';
import { Form, TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';

const useContainer = () => {
  const [form] = Form.useForm<AccountForm>();
  const [params, setParams] = useState<AccountSearchParams>({ page_num: 1, page_size: 10 });
  const [visible, { setTrue: show, setFalse }] = useBoolean(false);

  const { data, loading, run, refresh } = useRequest(searchAccount, { manual: true });

  const { runAsync: create } = useRequest(createAccount, { manual: true });

  const handleTableChange: TableProps<Account>['onChange'] = (pagination) => {
    setParams({
      page_num: pagination.current || 1,
      page_size: pagination.pageSize || 10,
    });
  };

  const search = (keywords: string) => {
    setParams({ keywords, page_num: 1, page_size: 10 });
  };

  const hide = () => {
    setFalse();
    form.resetFields();
  };

  const submit = async () => {
    if (!(await form.validateFields())) return;
    const values: AccountForm = form.getFieldsValue();
    const res = await create(values);
    if (!res.ok) return;
    refresh();
    hide();
  };

  useEffect(() => {
    run(params);
  }, [params]);

  return {
    form,
    state: {
      params,
      loading,
      visible,
      total: data?.data?.total || 0,
      accounts: data?.data?.data || [],
    },
    show,
    hide,
    submit,
    search,
    refresh,
    handleTableChange,
  };
};

export const AccountListModel = createContainer(useContainer);
export const useAccountListModel = AccountListModel.useContainer;

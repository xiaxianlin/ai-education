import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { createActionColumn, useDelete } from '@/hooks';
import { AbilityApi } from '../../api';
import { useAbilityListModel } from '../models/page';

export default function TableView() {
  const {
    actionRef,
    subject,
    formProps: { showForm },
  } = useAbilityListModel();

  const navigate = useNavigate();

  const { handleDelete } = useDelete(AbilityApi.deleteDomain, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const columns = useMemo<ProColumns<AbilityDomain>[]>(
    () => [
      {
        title: '能力域',
        dataIndex: 'name',
        width: 200,
        render: (text, record) => (
          <Button type="link" onClick={() => navigate(`/ability/detail/${record.id}`)}>
            {text}
          </Button>
        ),
      },
      { title: '标识', dataIndex: 'code', width: 150 },
      {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        width: 300,
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        width: 100,
        render: (is_active) => (is_active === 1 ? <Tag color="success">启用</Tag> : <Tag color="default">禁用</Tag>),
      },
      createActionColumn<AbilityDomain>(
        (record) => (
          <>
            <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
            <Button size="small" key="delete" type="link" danger onClick={() => handleDelete(record.id)}>
              删除
            </Button>
          </>
        ),
        { width: 180 },
      ),
    ],
    [showForm, handleDelete, navigate],
  );

  return (
    <ProTable<AbilityDomain>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      headerTitle={
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showForm()}>
          新增能力域
        </Button>
      }
      request={async () => {
        const data = await AbilityApi.searchDomains({ subject });
        return { data, success: true, total: data.length };
      }}
      pagination={false}
    />
  );
}

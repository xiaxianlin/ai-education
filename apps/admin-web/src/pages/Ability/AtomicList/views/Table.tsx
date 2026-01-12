import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Select, Space, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { createActionColumn, useDelete } from '@/hooks';
import { AbilityApi } from '../../api';
import { useAtomicListModel } from '../models/page';

export default function TableView() {
  const {
    actionRef,
    subject,
    grade,
    domainCode,
    setDomainCode,
    formProps: { showForm },
  } = useAtomicListModel();

  const [domains, setDomains] = useState<AbilityDomain[]>([]);

  const { handleDelete } = useDelete(AbilityApi.deleteAtomic, {
    onSuccess: () => actionRef.current?.reload(),
  });

  // 加载能力域列表
  useEffect(() => {
    if (subject) {
      AbilityApi.searchDomains({ subject }).then(setDomains);
    } else {
      setDomains([]);
    }
  }, [subject]);

  const columns = useMemo<ProColumns<AbilityAtomic>[]>(
    () => [
      {
        title: '能力域',
        dataIndex: 'domain_code',
        width: 150,
        render: (code) => {
          const domain = domains.find((d) => d.code === code);
          return domain?.name || code;
        },
      },
      { title: '能力名称', dataIndex: 'name', width: 200 },
      { title: '能力代码', dataIndex: 'code', width: 150 },
      {
        title: '描述',
        dataIndex: 'description',
        ellipsis: true,
        width: 300,
      },

      {
        title: '难度',
        dataIndex: 'difficulty',
        width: 80,
        renderText: (difficulty) => (
          <Tag color={difficulty >= 4 ? 'red' : difficulty >= 3 ? 'orange' : 'green'}>{difficulty}</Tag>
        ),
      },
      createActionColumn<AbilityAtomic>(
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
        { width: 120 },
      ),
    ],
    [showForm, handleDelete, domains],
  );

  return (
    <ProTable<AbilityAtomic>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      headerTitle={
        <Space>
          <Select
            placeholder="筛选能力域"
            allowClear
            style={{ width: 200 }}
            value={domainCode}
            onChange={setDomainCode}
            options={domains.map((d) => ({ label: d.name, value: d.code }))}
          />
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showForm()}>
            新增原子能力
          </Button>
        </Space>
      }
      request={async () => {
        const data = await AbilityApi.searchAtomics({
          subject,
          grade,
          domain_code: domainCode,
        });
        return { data, success: true, total: data.length };
      }}
      pagination={false}
    />
  );
}

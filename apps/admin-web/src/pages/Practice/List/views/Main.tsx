import { useMemo } from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Select, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePracticeListModel } from '../models/page';
import { DeleteButton } from '@/components';
import { adminApi } from '@/lib/api';
import { createTimeColumn, createActionColumn } from '@/hooks';
import { PRACTICE_TYPE_LABELS } from '@/constants/practice';
import FormDrawer from './FormDrawer';

const PRACTICE_TYPE_OPTIONS = [
  { label: '日常练习', value: 'daily_practice' },
  { label: '单元练习', value: 'unit_practice' },
  { label: '综合评估', value: 'assessment' },
];

const TYPE_OPTIONS = [
  { label: '系统', value: 'system' },
  { label: '自定义', value: 'custom' },
];

export default function MainView() {
  const { actionRef, handleDelete, handleCreate, handleEdit } = usePracticeListModel();

  const columns = useMemo<ProColumns<Practice>[]>(
    () => [
      {
        title: '名称',
        dataIndex: 'name',
        width: 150,
      },
      {
        title: '标识',
        dataIndex: 'slug',
        width: 150,
      },
      {
        title: '类型',
        dataIndex: 'type',
        width: 100,
        valueEnum: {
          system: '系统',
          custom: '自定义',
        },
        render: (_, record) => (
          <Tag color={record.type === 'system' ? 'blue' : 'green'}>
            {record.type === 'system' ? '系统' : '自定义'}
          </Tag>
        ),
        renderFormItem: () => (
          <Select placeholder="请选择类型" options={TYPE_OPTIONS} />
        ),
      },
      {
        title: '练习类型',
        dataIndex: 'practice_type',
        width: 120,
        valueEnum: PRACTICE_TYPE_LABELS,
        renderFormItem: () => (
          <Select placeholder="请选择练习类型" options={PRACTICE_TYPE_OPTIONS} />
        ),
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: 200,
        ellipsis: true,
        hideInSearch: true,
      },
      createTimeColumn<Practice>('创建时间', 'create_time', { width: 180 }),
      createActionColumn<Practice>(
        (record) => (
          <>
            <Button type="link" onClick={() => handleEdit(record.id)}>
              编辑
            </Button>
            {record.type === 'custom' && (
              <DeleteButton onConfirm={() => handleDelete(record.id)} />
            )}
          </>
        ),
        { width: 100 },
      ),
    ],
    [handleEdit, handleDelete]
  );

  return (
    <PageContainer title="练习列表" header={{ breadcrumb: {} }}>
      <ProTable<Practice>
        bordered
        cardBordered
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultCollapsed: true,
          defaultColsNumber: 6,
        }}
        headerTitle={
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建练习
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await adminApi.listPractices({
            page: current || 1,
            size: pageSize || 10,
            name: filter.name,
            slug: filter.slug,
            type: filter.type,
            practice_type: filter.practice_type,
          });
          return {
            data: data?.data || [],
            success: true,
            total: data?.total || 0,
          };
        }}
      />
      <FormDrawer />
    </PageContainer>
  );
}


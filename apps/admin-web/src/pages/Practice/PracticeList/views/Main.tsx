import { DeleteButton } from '@/components';
import { createActionColumn, createTimeColumn, useConfigs } from '@/hooks';
import { SCENE_TYPE_LABELS, SceneType, STAGE_LABELS } from '@ai-education/shared-web';
import { CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Select, Tag } from 'antd';
import { useMemo } from 'react';
import { PracticeApi } from '../../api';
import { usePracticeListModel } from '../models/page';

const TYPE_OPTIONS = [
  { label: '系统', value: 'system' },
  { label: '自定义', value: 'custom' },
];

const SCENE_TYPE_OPTIONS = Object.entries(SCENE_TYPE_LABELS).map(([value, label]) => ({
  label,
  value,
}));

const STATUS_OPTIONS = [
  { label: '启用', value: true },
  { label: '禁用', value: false },
];

export default function MainView() {
  const { actionRef, handleDelete, handleCreate, handleEdit, handleDetail, navigate } = usePracticeListModel();
  const { subjects } = useConfigs();

  const columns = useMemo<ProColumns<Practice>[]>(
    () => [
      { title: '名称', dataIndex: 'name', width: 150 },
      { title: '标识', dataIndex: 'slug', width: 120, hideInSearch: true },
      {
        title: '类型',
        dataIndex: 'type',
        width: 90,
        valueEnum: { system: '系统', custom: '自定义' },
        render: (_, record) => (
          <Tag color={record.type === 'system' ? 'blue' : 'green'}>{record.type === 'system' ? '系统' : '自定义'}</Tag>
        ),
        renderFormItem: () => <Select placeholder="请选择类型" options={TYPE_OPTIONS} allowClear />,
      },
      {
        title: '场景类型',
        dataIndex: 'scene_type',
        width: 100,
        valueEnum: Object.entries(SCENE_TYPE_LABELS).reduce((acc, [key, label]) => ({ ...acc, [key]: label }), {}),
        render: (_, record) =>
          record.scene_type ? <Tag>{SCENE_TYPE_LABELS[record.scene_type as SceneType]}</Tag> : '-',
        renderFormItem: () => <Select placeholder="请选择场景" options={SCENE_TYPE_OPTIONS} allowClear />,
      },
      {
        title: '科目',
        dataIndex: 'subject',
        width: 80,
        renderFormItem: () => (
          <Select
            placeholder="请选择科目"
            allowClear
            options={subjects?.map((s: string) => ({ label: s, value: s }))}
          />
        ),
      },
      {
        title: '学段',
        dataIndex: 'stages',
        width: 120,
        hideInSearch: true,
        render: (_, record) =>
          record.stages?.length ? (
            <>
              {record.stages.map((stage) => (
                <Tag key={stage} color="purple">
                  {STAGE_LABELS[stage as Stage] || stage}
                </Tag>
              ))}
            </>
          ) : (
            '-'
          ),
      },
      {
        title: '年级',
        dataIndex: 'grades',
        width: 150,
        hideInSearch: true,
        render: (_, record) =>
          record.grades?.length ? (
            <>
              {record.grades.map((g) => (
                <Tag key={g}>{g}年级</Tag>
              ))}
            </>
          ) : (
            '-'
          ),
      },
      {
        title: '排序',
        dataIndex: 'sort_order',
        width: 70,
        hideInSearch: true,
      },
      {
        title: '状态',
        dataIndex: 'is_active',
        width: 80,
        render: (_, record) =>
          record.is_active ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              启用
            </Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="default">
              禁用
            </Tag>
          ),
        renderFormItem: () => <Select placeholder="请选择状态" options={STATUS_OPTIONS} allowClear />,
      },
      createTimeColumn<Practice>('创建时间', 'create_time', { width: 160, hideInSearch: true }),
      createActionColumn<Practice>(
        (record) => (
          <>
            <Button type="link" size="small" onClick={() => navigate(`/practice/config?id=${record.id}`)}>
              参数
            </Button>
            <Button type="link" size="small" onClick={() => handleDetail(record.id)}>
              详情
            </Button>
            <Button type="link" size="small" onClick={() => handleEdit(record.id)}>
              编辑
            </Button>
            {record.type === 'custom' && <DeleteButton onConfirm={() => handleDelete(record.id)} />}
          </>
        ),
        { width: 180 },
      ),
    ],
    [handleEdit, handleDelete, handleDetail, navigate, subjects],
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
        scroll={{ x: 'max-content' }}
        headerTitle={
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate}>
            新建练习
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await PracticeApi.listPractices({
            page: current || 1,
            size: pageSize || 10,
            name: filter.name,
            type: filter.type,
            scene_type: filter.scene_type as SceneType,
            subject: filter.subject,
            is_active: filter.is_active,
          });
          return {
            data: data?.data || [],
            success: true,
            total: data?.total || 0,
          };
        }}
      />
    </PageContainer>
  );
}

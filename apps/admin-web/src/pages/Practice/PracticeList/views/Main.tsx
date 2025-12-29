import { DeleteButton } from '@/components';
import { createActionColumn, createTimeColumn, useConfigs } from '@/hooks';
import { GRADES, SPECIALTY_TYPE_LABELS, SpecialtyType, STAGE_LABELS } from '@ai-education/shared-web';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Select, Tag } from 'antd';
import { useMemo } from 'react';
import { PracticeApi } from '../../api';
import { usePracticeListModel } from '../models/page';

const SPECIALTY_TYPE_OPTIONS = Object.entries(SPECIALTY_TYPE_LABELS).map(([value, label]) => ({
  label,
  value,
}));

export default function MainView() {
  const { actionRef, handleDelete, handleCreate, handleEdit, handleDetail, handleClone, navigate } =
    usePracticeListModel();
  const { subjects } = useConfigs();

  const columns = useMemo<ProColumns<Practice>[]>(
    () => [
      {
        title: '科目',
        dataIndex: 'subject',
        width: 50,
        renderFormItem: () => (
          <Select
            placeholder="请选择科目"
            allowClear
            options={subjects?.map((s: string) => ({ label: s, value: s }))}
          />
        ),
      },
      { title: '名称', dataIndex: 'name', width: 120 },
      { title: '标识', dataIndex: 'slug', width: 120, hideInSearch: true },
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
                <Tag key={g}>{GRADES[g]}</Tag>
              ))}
            </>
          ) : (
            '-'
          ),
      },
      {
        title: '专项类型',
        dataIndex: 'specialty_type',
        width: 120,
        valueEnum: Object.entries(SPECIALTY_TYPE_LABELS).reduce((acc, [key, label]) => ({ ...acc, [key]: label }), {}),
        render: (_, record) =>
          record.specialty_type ? <Tag>{SPECIALTY_TYPE_LABELS[record.specialty_type as SpecialtyType]}</Tag> : '-',
        renderFormItem: () => <Select placeholder="请选择专项类型" options={SPECIALTY_TYPE_OPTIONS} allowClear />,
      },
      createTimeColumn<Practice>('创建时间', 'create_time', { width: 160, hideInSearch: true }),
      createActionColumn<Practice>(
        (record) => (
          <>
            <Button type="link" size="small" onClick={() => handleDetail(record.id)}>
              详情
            </Button>
            <Button type="link" size="small" onClick={() => handleEdit(record.id)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => handleClone(record.id)}>
              复制
            </Button>
            <DeleteButton onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 150 },
      ),
    ],
    [handleDelete, handleDetail, handleEdit, handleClone, navigate],
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
            specialty_type: filter.specialty_type as SpecialtyType,
            subject: filter.subject,
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

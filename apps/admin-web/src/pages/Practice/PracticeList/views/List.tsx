import { DeleteButton } from '@/components';
import { createActionColumn, createTimeColumn } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ABILITY_TYPE_MAP, GRADES, STAGE_LABELS } from '@ai-education/shared-web';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Select, Tag } from 'antd';
import { useEffect, useMemo } from 'react';
import { PracticeApi } from '../../api';
import { usePracticeListModel } from '../models/page';

export function ListView() {
  const { subject, grade } = useInitialStateModel();
  const { actionRef, handleDelete, handleCreate, handleEdit, handleDetail, handleClone, navigate } =
    usePracticeListModel();

  const columns = useMemo<ProColumns<Practice>[]>(
    () => [
      {
        title: '名称',
        dataIndex: 'name',
        width: 120,
        render: (text, record) => (
          <Button type="link" onClick={() => handleDetail(record.id)}>
            {text}
          </Button>
        ),
      },
      { title: '标识', dataIndex: 'slug', width: 120, hideInSearch: true },
      { title: '科目', dataIndex: 'subject', width: 50 },
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
        render: (_, record) => {
          if (!record.specialty_type) return '-';
          const subjectMap = record.subject ? ABILITY_TYPE_MAP[record.subject] : {};
          const label = subjectMap?.[record.specialty_type] || record.specialty_type;
          return <Tag>{label}</Tag>;
        },
        renderFormItem: () => {
          // 构建所有科目的能力类型选项
          const allOptions = Object.entries(ABILITY_TYPE_MAP).flatMap(([subject, types]) =>
            Object.entries(types).map(([value, label]) => ({ label: `${subject}-${label}`, value }))
          );
          return <Select placeholder="请选择专项类型" options={allOptions} allowClear />;
        },
      },
      createTimeColumn<Practice>('创建时间', 'create_time', { width: 160, hideInSearch: true }),
      createActionColumn<Practice>(
        (record) => (
          <>
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

  useEffect(() => {
    actionRef.current?.reload();
  }, [subject, grade]);

  return (
    <ProTable<Practice>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      scroll={{ x: 'max-content' }}
      headerTitle={
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate}>
          新建练习
        </Button>
      }
      request={async ({ pageSize, current }) => {
        const data = await PracticeApi.listPractices({
          page: current || 1,
          size: pageSize || 10,
          subject,
          grade,
        });
        return {
          data: data?.data || [],
          success: true,
          total: data?.total || 0,
        };
      }}
    />
  );
}

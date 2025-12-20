import { useMemo } from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePracticePromptModel } from '../models/page';
import { DeleteButton } from '@/components';
import { adminApi } from '@/lib/api';
import { createTimeColumn, createActionColumn } from '@/hooks';
import { PRACTICE_TYPE_LABELS } from '@/constants/practice';
import { GRADES, SUBJECTS } from '@/constants/course';

const PRACTICE_TYPE_OPTIONS = [
  { label: '日常练习', value: 'daily_practice' },
  { label: '单元练习', value: 'unit_practice' },
  { label: '综合评估', value: 'assessment' },
];

const GRADE_OPTIONS = Object.keys(GRADES).map((key) => ({
  label: GRADES[Number(key)],
  value: Number(key),
}));

export default function ListView() {
  const { actionRef, handleDelete, handleCreate, handleEdit } = usePracticePromptModel();

  const columns = useMemo<ProColumns<PracticePrompt>[]>(
    () => [
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
        title: '科目',
        dataIndex: 'subject',
        width: 100,
        valueEnum: SUBJECTS.reduce((acc, s) => ({ ...acc, [s]: s }), {}),
      },
      {
        title: '年级',
        dataIndex: 'grade',
        width: 100,
        valueType: 'select',
        valueEnum: GRADE_OPTIONS.reduce(
          (acc, opt) => ({ ...acc, [opt.value]: opt.label }),
          {}
        ),
      },
      {
        title: '提示词名称',
        dataIndex: 'prompt_name',
        width: 150,
        hideInSearch: true,
      },
      {
        title: '提示词标识',
        dataIndex: 'prompt_slug',
        width: 150,
        hideInSearch: true,
      },
      createTimeColumn<PracticePrompt>('创建时间', 'create_time', { width: 180 }),
      createActionColumn<PracticePrompt>(
        (record) => (
          <>
            <Button type="link" onClick={() => handleEdit(record.id)}>
              编辑
            </Button>
            <DeleteButton onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 100 },
      ),
    ],
    [handleEdit, handleDelete]
  );

  return (
    <PageContainer title="练习提示词管理" header={{ breadcrumb: {} }}>
      <ProTable<PracticePrompt>
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
            新建关联
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await adminApi.listPracticePrompts({
            page: current || 1,
            size: pageSize || 10,
            practice_type: filter.practice_type,
            subject: filter.subject,
            grade: filter.grade,
            prompt_id: filter.prompt_id,
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


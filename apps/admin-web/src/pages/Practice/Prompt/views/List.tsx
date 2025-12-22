import { useMemo } from 'react';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePracticePromptModel } from '../models/page';
import { DeleteButton } from '@/components';
import { PracticeApi } from '../../api';
import { createTimeColumn, createActionColumn } from '@/hooks';
import { GRADES, SUBJECTS } from '@/constants/course';

const GRADE_OPTIONS = Object.keys(GRADES).map((key) => ({
  label: GRADES[Number(key)],
  value: Number(key),
}));

export default function ListView() {
  const { actionRef, handleDelete, handleCreate, handleEdit } = usePracticePromptModel();

  const columns = useMemo<ProColumns<PracticePrompt>[]>(
    () => [
      {
        title: '练习标识',
        dataIndex: 'practice_slug',
        width: 150,
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
        valueEnum: GRADE_OPTIONS.reduce((acc, opt) => ({ ...acc, [opt.value]: opt.label }), {}),
      },
      {
        title: '提示词名称',
        dataIndex: ['prompt', 'name'],
        width: 150,
        hideInSearch: true,
      },
      {
        title: '提示词标识',
        dataIndex: 'prompt_slug',
        width: 150,
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
    [handleEdit, handleDelete],
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
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate}>
            新建关联
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await PracticeApi.listPracticePrompts({
            page: current || 1,
            size: pageSize || 10,
            practice_slug: filter.practice_slug,
            subject: filter.subject,
            grade: filter.grade,
            prompt_slug: filter.prompt_slug,
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

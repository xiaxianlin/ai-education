import { DeleteButton } from '@/components';
import { GRADES, SUBJECTS } from '@/constants/course';
import { createActionColumn, createTimeColumn } from '@/hooks';
import { SCENE_TYPE_LABELS, SPECIALTY_TYPE_LABELS, SceneType, SpecialtyType } from '@ai-education/shared-web';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { useMemo } from 'react';
import { PracticeApi } from '../../api';
import { usePromptListModel } from '../models/page';

export default function MainView() {
  const { actionRef, handleDelete, handleCreate, handleEdit, handleDetail } = usePromptListModel();

  const columns = useMemo<ProColumns<PracticePrompt>[]>(
    () => [
      {
        title: '配置名称',
        dataIndex: 'name',
        width: 150,
        hideInSearch: true,
      },
      {
        title: '场景类型',
        dataIndex: 'scene_type',
        width: 120,
        valueEnum: Object.entries(SCENE_TYPE_LABELS).reduce((acc, [key, label]) => ({ ...acc, [key]: label }), {}),
      },
      {
        title: '专项类型',
        dataIndex: 'specialty_type',
        width: 120,
        hideInSearch: true,
        render: (_, record) =>
          record.specialty_type ? SPECIALTY_TYPE_LABELS[record.specialty_type as SpecialtyType] : '-',
      },
      {
        title: '科目',
        dataIndex: 'subject',
        width: 100,
        valueEnum: SUBJECTS.reduce((acc, s) => ({ ...acc, [s]: s }), {}),
      },
      {
        title: '年级',
        dataIndex: 'grades',
        width: 150,
        hideInSearch: true,
        render: (_, record) => (
          <>
            {(record.grades || []).map((g) => (
              <Tag key={g}>{GRADES[g]}</Tag>
            ))}
          </>
        ),
      },
      {
        title: '关联提示词',
        dataIndex: ['prompt', 'name'],
        width: 150,
        hideInSearch: true,
      },
      createTimeColumn<PracticePrompt>('创建时间', 'create_time', { width: 180 }),
      createActionColumn<PracticePrompt>(
        (record) => (
          <>
            <Button type="link" onClick={() => handleDetail(record.id)}>
              详情
            </Button>
            <Button type="link" onClick={() => handleEdit(record.id)}>
              编辑
            </Button>
            <DeleteButton onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 120 },
      ),
    ],
    [handleEdit, handleDelete, handleDetail],
  );

  return (
    <PageContainer title="练习提示词配置" header={{ breadcrumb: {} }}>
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
        scroll={{ x: 'max-content' }}
        headerTitle={
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate}>
            新建配置
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await PracticeApi.listPracticePrompts({
            page: current || 1,
            size: pageSize || 10,
            scene_type: filter.scene_type as SceneType,
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

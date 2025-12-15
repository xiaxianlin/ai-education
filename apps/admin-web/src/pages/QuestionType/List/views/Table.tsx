import { PageContainer, ProColumns } from '@ant-design/pro-components';
import { useQuestionTypeListModel } from '../models/page';
import { Button, Space, Tag } from 'antd';
import { adminApi } from '@/lib/api';
import { useMemo } from 'react';
import { GRADES } from '@/constants/course';
import { useConfigs, useDelete } from '@/hooks';
import { CommonTable, DeleteButton } from '@/components/business';
import { RESOURCE_TYPE_OPTIONS } from '@/constants/question';

export default function TableView() {
  const { subjectEnum, gradeEnum, questionSceneEmun } = useConfigs();
  const { actionRef, showForm } = useQuestionTypeListModel();

  // 删除题型
  const { handleDelete } = useDelete(adminApi.deleteQuestionType, {
    onSuccess: () => actionRef.current?.reload(),
  });

  const columns = useMemo<ProColumns<QuestionType>[]>(
    () => [
      {
        title: '标题',
        dataIndex: 'title',
        valueType: 'text',
      },
      {
        title: '类型',
        dataIndex: 'scene',
        valueType: 'select',
        valueEnum: questionSceneEmun,
        render: (_, record) => <Tag>{record.scene}</Tag>,
      },
      {
        title: '科目',
        dataIndex: 'subject',
        valueType: 'select',
        valueEnum: subjectEnum,
        render: (_, record) => {
          const subject = record.subject;
          const subjectColorMap: Record<string, string> = {
            数学: 'blue',
            英语: 'orange',
          };
          const color = subjectColorMap[subject] || 'default';
          return <Tag color={color}>{subject}</Tag>;
        },
      },
      {
        title: '年级',
        dataIndex: 'grade',
        valueType: 'select',
        valueEnum: gradeEnum,
        render: (_, record) => GRADES[record.grade] || record.grade,
      },
      {
        title: '资源类型',
        dataIndex: 'resource_type',
        valueType: 'select',
        valueEnum: RESOURCE_TYPE_OPTIONS,
        hideInSearch: true,
        render: (_, record) => {
          if (!record.resource_type) {
            return <Tag>无</Tag>;
          }
          return <Tag color="blue">{RESOURCE_TYPE_OPTIONS[record.resource_type]}</Tag>;
        },
      },
      {
        title: '描述',
        dataIndex: 'description',
        valueType: 'textarea',
        hideInSearch: true,
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: 150,
        render: (_, record) => (
          <Space>
            <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
            <DeleteButton buttonProps={{ size: 'small', type: 'link' }} onConfirm={() => handleDelete(record.id)} />
          </Space>
        ),
      },
    ],
    [showForm, subjectEnum, gradeEnum, handleDelete],
  );

  return (
    <PageContainer title="题型管理" header={{ breadcrumb: {} }}>
      <CommonTable<QuestionType>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          defaultColsNumber: 4,
          defaultCollapsed: false,
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={() => showForm()}>
            新增题型
          </Button>,
        ]}
        request={async ({ pageSize, current, ...filter }) => {
          const data = await adminApi.searchQuestionTypes({
            page: current || 1,
            size: pageSize || 10,
            ...filter,
          });
          return {
            data: data.data || [],
            success: true,
            total: data.total || 0,
          };
        }}
      />
    </PageContainer>
  );
}

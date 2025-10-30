import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { useTextbookListModel } from '../models/page';
import { Button, Space, Tag } from 'antd';
import { TextbookApi } from '@/services/textbook';
import { useMemo } from 'react';
import { GRADES } from '@/constants/course';
import { StatusTag } from '@/components/ui';
import { fmtTime } from '@/utils/time';
import { Link } from '@umijs/max';
import { useConfigs } from '@/hooks';

export default function MainView() {
  const { semesters, textbook_versions, subjectEnum, gradeEnum } = useConfigs();
  const { actionRef, instance, edited, visible, showForm, onCancel, updateStatus, handleSubmit } =
    useTextbookListModel();

  const columns = useMemo<ProColumns<Textbook>[]>(
    () => [
      {
        title: '科目',
        dataIndex: 'subject',
        valueType: 'select',
        valueEnum: subjectEnum,
      },
      {
        title: '版本',
        dataIndex: 'version',
        valueType: 'select',
      },
      {
        title: '阶段',
        dataIndex: 'grade',
        hideInSearch: true,
        renderText: (grade) => GRADES[grade].stage,
      },
      {
        title: '年级',
        dataIndex: 'grade',
        valueType: 'select',
        valueEnum: gradeEnum,
      },
      { title: '学期', dataIndex: 'semester', hideInSearch: true },
      {
        title: '文件上传',
        dataIndex: 'name',
        hideInSearch: true,
        render: (_, record) =>
          record.file ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>,
      },
      {
        title: '单元解析',
        dataIndex: 'is_parsed',
        hideInSearch: true,
        render: (is_parsed) => (is_parsed ? <Tag color="success">已解析</Tag> : <Tag>未解析</Tag>),
      },
      {
        title: '状态',
        dataIndex: 'status',
        hideInSearch: true,
        render: (status) => <StatusTag status={status === 1} />,
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        hideInSearch: true,
        renderText: (time) => fmtTime(time),
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        hideInSearch: true,
        renderText: (time) => fmtTime(time),
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <Space>
            <Link key="detail" to={`/textbook/detail/${record.id}`}>
              <Button size="small" type="link">
                详情
              </Button>
            </Link>
            <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
          </Space>
        ),
      },
    ],
    [showForm, updateStatus],
  );
  return (
    <PageContainer
      header={{
        breadcrumb: {},
        title: '教材管理',
        extra: [
          <Button type="primary" onClick={() => showForm()}>
            新增教材
          </Button>,
        ],
      }}
    >
      <ProTable<Textbook>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultColsNumber: 3,
          defaultCollapsed: false,
        }}
        scroll={{ x: 'max-content' }}
        toolbar={{ actions: [] }}
        request={async ({ pageSize, current, ...filter }) => {
          console.log(filter);
          const data = await TextbookApi.search({
            page: current || 1,
            size: pageSize || 10,
            ...filter,
          });
          return {
            data: data.data || [],
            success: true,
            total: data.total,
          };
        }}
        pagination={{ pageSize: 10 }}
      />
      <ModalForm<TextbookForm>
        width={600}
        form={instance}
        open={visible}
        title={edited ? '更新教材' : '新增教材'}
        onFinish={handleSubmit}
        modalProps={{ destroyOnClose: true, onCancel }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 3 }}
      >
        <div className="pt-3" />
        <ProFormSelect
          name="subject"
          label="科目"
          placeholder="请选择科目"
          rules={[{ required: true }]}
          valueEnum={subjectEnum}
        />
        <ProFormSelect
          name="version"
          label="版本"
          placeholder="请选择版本"
          rules={[{ required: true }]}
          valueEnum={textbook_versions?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
        />
        <ProFormSelect
          name="grade"
          label="年级"
          placeholder="请选择年级"
          rules={[{ required: true }]}
          valueEnum={gradeEnum}
        />
        <ProFormSelect
          name="semester"
          label="学期"
          placeholder="请选择学期"
          rules={[{ required: true }]}
          valueEnum={semesters?.reduce((prev, curr) => ({ ...prev, [curr]: curr }), {})}
        />
      </ModalForm>
    </PageContainer>
  );
}

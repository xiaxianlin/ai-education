import {
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormText,
  ProTable,
  ProFormSelect,
} from '@ant-design/pro-components';
import { useStudentListModel } from '../models/page';
import { Button } from 'antd';
import { StudentApi } from '@/services/student';
import { useMemo } from 'react';
import { StatusTag } from '@/components/ui';
import { fmtTime } from '@/utils/time';
import { Link } from '@umijs/max';

export default function MainView() {
  const { actionRef, instance, edited, visible, showForm, onCancel, handleSubmit } =
    useStudentListModel();

  const columns = useMemo<ProColumns<Student>[]>(
    () => [
      {
        title: '姓名',
        dataIndex: 'name',
        width: 120,
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        width: 130,
      },
      {
        title: '状态',
        dataIndex: 'status',
        hideInSearch: true,
        width: 80,
        render: (status) => <StatusTag status={status === 1} />,
      },
      {
        title: '状态',
        dataIndex: 'status',
        valueType: 'select',
        valueEnum: {
          1: { text: '启用', status: 'Success' },
          0: { text: '停用', status: 'Error' },
        },
        hideInTable: true,
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        hideInSearch: true,
        width: 170,
        renderText: (time) => fmtTime(time),
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        hideInSearch: true,
        width: 170,
        renderText: (time) => (time ? fmtTime(time) : '-'),
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: 80,
        render: (_, record) => (
          <Link key="detail" to={`/student/detail/${record.id}`}>
            <Button size="small" type="link">
              详情
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <PageContainer title="学生管理" header={{ breadcrumb: {} }}>
      <ProTable<Student>
        bordered
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultColsNumber: 6,
          defaultCollapsed: false,
        }}
        scroll={{ x: 'max-content' }}
        headerTitle={
          <Button type="primary" onClick={() => showForm()}>
            新增学生
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await StudentApi.search({
            page: current || 1,
            size: pageSize || 10,
            ...filter,
            keywords: filter.name,
          });
          return {
            data: data.data || [],
            success: true,
            total: data.total,
          };
        }}
      />
      <ModalForm<StudentForm | StudentUpdateForm>
        width={500}
        form={instance}
        open={visible}
        title={edited ? '更新学生' : '新增学生'}
        onFinish={handleSubmit}
        modalProps={{ destroyOnHidden: true, onCancel }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 4 }}
      >
        <div className="pt-3" />
        <ProFormText
          name="name"
          label="姓名"
          placeholder="请输入姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
          fieldProps={{ maxLength: 50 }}
        />
        <ProFormText
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
          fieldProps={{ maxLength: 11 }}
        />
      </ModalForm>
    </PageContainer>
  );
}

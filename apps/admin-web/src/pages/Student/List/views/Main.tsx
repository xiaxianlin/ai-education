import { PageContainer, ProColumns, ProFormText } from '@ant-design/pro-components';
import { useStudentListModel } from '../models/page';
import { Button } from 'antd';
import { adminApi } from '@ai-education/shared-student';
import { useMemo } from 'react';
import { Link } from '@umijs/max';
import { CommonTable, FormModal } from '@/components/business';
import {
  createTimeColumn,
  createStatusColumn,
  createStatusSearchColumn,
  createActionColumn,
} from '@/hooks';

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
      createStatusColumn<Student>(),
      createStatusSearchColumn<Student>(),
      createTimeColumn<Student>('创建时间', 'create_time'),
      createTimeColumn<Student>('更新时间', 'update_time'),
      createActionColumn<Student>(
        (_, record) => (
          <Link key="detail" to={`/student/detail/${record.id}`}>
            <Button size="small" type="link">
              详情
            </Button>
          </Link>
        ),
        { width: 80 },
      ),
    ],
    [],
  );

  return (
    <PageContainer title="学生管理" header={{ breadcrumb: {} }}>
      <CommonTable<Student>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{
          labelWidth: 'auto',
          layout: 'inline',
          defaultColsNumber: 6,
          defaultCollapsed: false,
        }}
        headerTitle={
          <Button type="primary" onClick={() => showForm()}>
            新增学生
          </Button>
        }
        request={async ({ pageSize, current, ...filter }) => {
          const data = await adminApi.searchStudents({
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
      <FormModal<StudentForm>
        form={instance}
        visible={visible}
        onCancel={onCancel}
        isEdit={!!edited}
        addTitle="新增学生"
        editTitle="更新学生"
        onFinish={handleSubmit}
      >
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
      </FormModal>
    </PageContainer>
  );
}

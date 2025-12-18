import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { adminApi } from '@/lib/api';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createActionColumn, createStatusColumn, createStatusSearchColumn, createTimeColumn } from '@/hooks';
import { PlusOutlined } from '@ant-design/icons';
import { useStudentListModel } from '../models/page';

export default function TableView() {
  const navigate = useNavigate();
  const {
    actionRef,
    formProps: { showForm },
  } = useStudentListModel();

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
        (record) => (
          <Button type="link" onClick={() => navigate(`/student/detail/${record.id}`)}>
            详情
          </Button>
        ),
        { width: 80 },
      ),
    ],
    [],
  );

  return (
    <ProTable<Student>
      bordered
      cardBordered
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>
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
  );
}



import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTeacherBookListModel } from '../models/page';
import { useConfigs } from '@/hooks';
import { GRADES } from '@/constants/course';
import { PlusOutlined } from '@ant-design/icons';
import { adminApi } from '@/lib/api';

export default function TableView() {
  const { subjectEnum, gradeEnum, textbookVersionEmun } = useConfigs();
  const {
    actionRef,
    tableRequest,
    formProps: { showForm },
  } = useTeacherBookListModel();

  const columns = useMemo<ProColumns<TeacherBook>[]>(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        valueType: 'digit',
        hideInSearch: true,
      },
      {
        title: '版本',
        dataIndex: 'version',
        valueType: 'select',
        valueEnum: textbookVersionEmun,
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
        hideInTable: false,
        render: (_, record) => `${GRADES[record.grade] || record.grade}${record.semester}`,
      },
      {
        title: '文件上传',
        dataIndex: 'name',
        hideInSearch: true,
        render: (_, record) => (record.file ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>),
      },
      {
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <Space>
            <Link key="detail" to={`/teacher_book/detail/${record.id}`}>
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
    [showForm, subjectEnum, textbookVersionEmun, gradeEnum],
  );

  return (
    <ProTable<TeacherBook>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={{
        labelWidth: 'auto',
        layout: 'inline',
        defaultColsNumber: 3,
        defaultCollapsed: false,
      }}
      headerTitle={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showForm()}>
          新增教师用书
        </Button>
      }
      request={async (params) => {
        const data = await adminApi.searchTeacherBooks({
          page: params.current || 1,
          size: params.pageSize || 10,
          ...params,
        });
        return {
          data: data.data || [],
          success: true,
          total: data.total || 0,
        };
      }}
      pagination={{ pageSize: 10 }}
    />
  );
}

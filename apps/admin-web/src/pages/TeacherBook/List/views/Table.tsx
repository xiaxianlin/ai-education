import { createActionColumn, useConfigs } from '@/hooks';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Tag } from 'antd';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TeacherBookApi } from '../../api';
import { useTeacherBookListModel } from '../models/page';

export default function TableView() {
  const { subjectEnum, gradeEnum } = useConfigs();
  const {
    grade,
    subject,
    actionRef,
    formProps: { showForm },
  } = useTeacherBookListModel();

  const columns = useMemo<ProColumns<TeacherBook>[]>(
    () => [
      { title: '版本', dataIndex: 'version' },
      { title: '学期', dataIndex: 'semester' },
      {
        title: '文件上传',
        dataIndex: 'name',
        render: (_, record) => (record.file ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>),
      },
      createActionColumn<TeacherBook>(
        (record) => (
          <>
            <Link key="detail" to={`/teacher_book/detail/${record.id}`}>
              <Button size="small" type="link">
                详情
              </Button>
            </Link>
            <Button size="small" key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
          </>
        ),
        { width: 120 },
      ),
    ],
    [showForm, subjectEnum, gradeEnum],
  );

  return (
    <ProTable<TeacherBook>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      headerTitle={
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showForm()}>
          新增教师用书
        </Button>
      }
      request={async () => {
        const data = await TeacherBookApi.searchTeacherBooks(subject, grade);
        return { data, success: true, total: data.length };
      }}
      pagination={false}
    />
  );
}

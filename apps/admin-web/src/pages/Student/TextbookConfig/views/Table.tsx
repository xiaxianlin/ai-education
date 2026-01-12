import { createActionColumn, useConfigs } from '@/hooks';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button } from 'antd';
import { useMemo } from 'react';
import { StudentApi } from '../../api';
import { useTextbookConfigModel } from '../models/page';

export default function TableView() {
  const { subjectEnum, gradeEnum } = useConfigs();
  const { studentId, subject, grade, actionRef, formProps } = useTextbookConfigModel();

  const columns = useMemo<ProColumns<StudentTextbookConfig>[]>(
    () => [
      {
        title: '学科',
        dataIndex: 'subject',
        width: 100,
        valueEnum: subjectEnum,
      },
      {
        title: '年级',
        dataIndex: 'grade',
        width: 100,
        valueEnum: gradeEnum,
      },
      {
        title: '学期',
        dataIndex: 'semester',
        width: 120,
      },
      {
        title: '版本',
        dataIndex: 'version',
        width: 200,
      },
      createActionColumn<StudentTextbookConfig>(
        (record) => (
          <>
            <Button size="small" type="link" onClick={() => formProps.showForm(record)}>
              编辑
            </Button>
            <Button
              size="small"
              type="link"
              danger
              onClick={async () => {
                if (!studentId) return;
                await StudentApi.deleteStudentTextbookConfig(studentId, record.id);
                actionRef.current?.reload();
              }}
            >
              删除
            </Button>
          </>
        ),
        { width: 120 },
      ),
    ],
    [subjectEnum, gradeEnum, formProps, studentId, actionRef],
  );

  if (!studentId) return null;

  return (
    <ProTable<StudentTextbookConfig>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      headerTitle={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => formProps.showForm()}>
          新增配置
        </Button>
      }
      request={async ({ pageSize, current }) => {
        const data = await StudentApi.getStudentTextbookConfigs(studentId, {
          page: current || 1,
          page_size: pageSize || 20,
        });
        // 根据选中的 subject 和 grade 过滤数据
        let filteredItems = data.items || [];
        if (subject) {
          filteredItems = filteredItems.filter((item) => item.subject === subject);
        }
        if (grade) {
          filteredItems = filteredItems.filter((item) => item.grade === grade);
        }
        return {
          data: filteredItems,
          success: true,
          total: filteredItems.length,
        };
      }}
    />
  );
}

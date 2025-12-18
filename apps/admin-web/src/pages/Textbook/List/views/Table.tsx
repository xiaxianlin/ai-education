import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

import { useTextbookListModel } from '../models/page';
import { useConfigs } from '@/hooks';
import { GRADES } from '@/constants/course';

export default function TableView() {
  const { subjectEnum, gradeEnum, textbookVersionEmun } = useConfigs();
  const { actionRef, showForm, tableRequest } = useTextbookListModel();

  const columns = useMemo<ProColumns<Textbook>[]>(
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
        render: (_, record) => `${GRADES[(record as any).grade] || (record as any).grade}${(record as any).semester}`,
      },
      {
        title: '文件上传',
        dataIndex: 'name',
        hideInSearch: true,
        render: (_, record) => (record.file ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>),
      },
      {
        title: '单元解析',
        dataIndex: 'is_parsed',
        hideInSearch: true,
        render: (is_parsed) => (is_parsed ? <Tag color="success">已解析</Tag> : <Tag>未解析</Tag>),
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
    [showForm, subjectEnum, textbookVersionEmun, gradeEnum],
  );

  return (
    <ProTable<Textbook>
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
          新增教材
        </Button>
      }
      request={tableRequest}
    />
  );
}



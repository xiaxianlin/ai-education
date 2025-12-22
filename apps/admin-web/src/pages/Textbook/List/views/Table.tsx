import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Flex, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';

import { useTextbookListModel } from '../models/page';
import { useConfigs } from '@/hooks';
import { GRADES } from '@/constants/course';
import { createActionColumn } from '@/hooks';
import { TextbookApi } from '../api';

export default function TableView() {
  const { subjectEnum, gradeEnum, textbookVersionEmun } = useConfigs();
  const {
    actionRef,
    subject,
    grade,
    formProps: { showForm },
  } = useTextbookListModel();

  const columns = useMemo<ProColumns<Textbook>[]>(
    () => [
      { title: 'ID', dataIndex: 'id' },
      { title: '版本', dataIndex: 'version' },
      { title: '学期', dataIndex: 'semester' },
      {
        title: '文件上传',
        dataIndex: 'name',
        render: (_, record) => (record.file ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>),
      },
      {
        title: '单元解析',
        dataIndex: 'is_parsed',
        render: (is_parsed) => (is_parsed ? <Tag color="success">已解析</Tag> : <Tag>未解析</Tag>),
      },
      createActionColumn<Textbook>(
        (record) => (
          <>
            <Link key="detail" to={`/textbook/detail/${record.id}`}>
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
    [showForm, subjectEnum, textbookVersionEmun, gradeEnum],
  );

  return (
    <ProTable<Textbook>
      bordered
      cardBordered
      actionRef={actionRef}
      rowKey="id"
      columns={columns}
      search={false}
      headerTitle={
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => showForm()}>
          新增教材
        </Button>
      }
      request={async () => {
        const data = await TextbookApi.searchTextbooks({ subject, grade });
        return { data, success: true, total: data.length };
      }}
      pagination={false}
    />
  );
}

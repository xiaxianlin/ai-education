import { DeleteButton } from '@/components';
import { RESOURCE_TYPE_OPTIONS } from '@/constants/question';
import { useConfigs } from '@/hooks';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Flex, Tag } from 'antd';
import { useMemo } from 'react';
import { useQuestionTypeListModel } from '../models/page';

import { createActionColumn } from '@/hooks/useTableColumns';

export default function TableView() {
  const { question_types } = useConfigs();
  const { data, scene, setScene, showForm, showCopyForm, handleDelete } = useQuestionTypeListModel();

  const columns = useMemo<ProColumns<QuestionType>[]>(
    () => [
      { title: '标题', dataIndex: 'title' },
      { title: '类型', dataIndex: 'scene' },
      {
        title: '资源类型',
        dataIndex: 'resource_type',
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
        render: (description) => description || '-',
      },
      createActionColumn<QuestionType>(
        (record) => (
          <>
            <Button key="edit" type="link" onClick={() => showForm(record)}>
              编辑
            </Button>
            <Button key="copy" type="link" onClick={() => showCopyForm(record)}>
              复制
            </Button>
            <DeleteButton buttonProps={{ type: 'link' }} onConfirm={() => handleDelete(record.id)} />
          </>
        ),
        { width: 220 },
      ),
    ],
    [showForm, showCopyForm, handleDelete],
  );

  return (
    <ProTable<QuestionType>
      bordered
      rowKey="id"
      search={false}
      columns={columns}
      dataSource={data}
      pagination={false}
      headerTitle={
        <Button type="primary" size="large" onClick={() => showForm()} icon={<PlusOutlined />}>
          新增题型
        </Button>
      }
      toolbar={{
        settings: [
          <Flex gap={8}>
            {question_types.map((item) => {
              const isActive = scene === item;
              return (
                <Tag
                  key={item}
                  variant="filled"
                  style={{ padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 400 }}
                  color={isActive ? 'volcano' : 'blue'}
                  onClick={() => setScene(isActive ? undefined : item)}
                >
                  {item}
                </Tag>
              );
            })}
          </Flex>,
        ],
      }}
    />
  );
}

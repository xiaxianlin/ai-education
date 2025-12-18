import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { useQuestionTypeListModel } from '../models/page';
import { Button, Radio, Tag, Tabs, Flex } from 'antd';
import { useMemo } from 'react';
import { useConfigs } from '@/hooks';
import { DeleteButton, SubjectGradeTabs } from '@/components';
import { RESOURCE_TYPE_OPTIONS } from '@/constants/question';
import { PlusOutlined } from '@ant-design/icons';

import { createActionColumn } from '@/hooks/useTableColumns';

export default function TableView() {
  const { question_scenes } = useConfigs();
  const { data, grade, subject, scene, setGrade, setSubject, setScene, showForm, showCopyForm, handleDelete } =
    useQuestionTypeListModel();

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
    <PageContainer title="题型管理" header={{ breadcrumb: {} }}>
      <SubjectGradeTabs subject={subject} grade={grade} setSubject={setSubject} setGrade={setGrade} />
      <ProTable<QuestionType>
        bordered
        rowKey="id"
        search={false}
        columns={columns}
        dataSource={data}
        pagination={false}
        headerTitle={
          <Flex gap={8}>
            {question_scenes.map((item) => {
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
          </Flex>
        }
        toolbar={{
          settings: [
            <Button type="primary" size="large" onClick={() => showForm()} icon={<PlusOutlined />}>
              新增题型
            </Button>,
          ],
        }}
      />
    </PageContainer>
  );
}

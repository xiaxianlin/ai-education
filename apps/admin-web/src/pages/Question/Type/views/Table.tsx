import { DeleteButton } from '@/components';
import { RESOURCE_TYPE_OPTIONS } from '@/constants/question';
import { useConfigs } from '@/hooks';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Flex, Modal, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useQuestionTypeListModel } from '../models/page';

import { createActionColumn } from '@/hooks/useTableColumns';

export default function TableView() {
  const { question_types } = useConfigs();
  const { data, scene, setScene, showForm, showCopyForm, handleDelete, handleBatchDelete, batchDeleteLoading } =
    useQuestionTypeListModel();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 当场景改变时，清空选中的行
  useEffect(() => {
    setSelectedRowKeys([]);
  }, [scene]);

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

  const handleBatchDeleteClick = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: '批量删除题型',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个题型吗？删除后无法恢复，请谨慎操作。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleBatchDelete(selectedRowKeys as number[]);
        setSelectedRowKeys([]);
      },
    });
  };

  return (
    <ProTable<QuestionType>
      bordered
      rowKey="id"
      search={false}
      columns={columns}
      dataSource={data}
      pagination={false}
      rowSelection={{
        selectedRowKeys,
        onChange: setSelectedRowKeys,
      }}
      headerTitle={
        <Flex gap={8}>
          <Button type="primary" size="large" onClick={() => showForm()} icon={<PlusOutlined />}>
            新增题型
          </Button>
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              size="large"
              onClick={handleBatchDeleteClick}
              loading={batchDeleteLoading}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
        </Flex>
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
                  onClick={() => {
                    setScene(isActive ? undefined : item);
                    setSelectedRowKeys([]);
                  }}
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

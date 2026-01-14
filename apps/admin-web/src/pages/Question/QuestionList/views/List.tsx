import { DeleteButton } from '@/components';
import { createActionColumn } from '@/hooks';
import { getResourceStatus, hasResources, RESOURCE_STATUS_CONFIG } from '@/utils/question';
import { PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Flex, Modal, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionApi } from '../../api';
import { useGenerateQuestionResources } from '../../hooks/useGenerateQuestionResources';
import { useQuestionListModel } from '../models/page';

export function ListView() {
  const navigate = useNavigate();
  const { actionRef, subject, grade, handleDelete, handleBatchDelete, batchDeleteLoading, handlePreview } =
    useQuestionListModel();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { handleGenerateResources, generatingResourceId, LoadingModal } = useGenerateQuestionResources(() => {
    actionRef.current?.reload?.();
  });

  const handleBatchDeleteClick = () => {
    if (selectedRowKeys.length === 0) return;

    Modal.confirm({
      title: '批量删除题目',
      content: `确定要删除选中的 ${selectedRowKeys.length} 道题目吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        handleBatchDelete(selectedRowKeys as string[]).then(() => {
          setSelectedRowKeys([]);
        });
      },
    });
  };

  const columns: ProColumns<Question>[] = [
    {
      title: '题目ID',
      dataIndex: 'id',
      width: 200,
      copyable: true,
      hideInTable: true, // 不在表格中显示，只在搜索中使用
    },
    {
      title: '题目名称',
      dataIndex: 'name',
      width: 200,
      hideInTable: true, // 不在表格中显示，只在搜索中使用
    },
    {
      title: '题干',
      ellipsis: true,
      width: 300,
      render: (_, record) => {
        const content = record.content || {};
        const stem = content.stem || '';
        const stemText = typeof stem === 'string' ? stem : (stem as Stem)?.text || '';
        return stemText || '-';
      },
    },
    {
      title: '题型名称',
      dataIndex: ['question_type', 'name'],
      width: 150,
    },
    // TODO: difficulty 字段已删除
    {
      title: '类型',
      width: 80,
      render: (_, record) => {
        const content = record.content || {};
        const isComposite = (content.sub_questions?.length || 0) > 0;
        return isComposite ? <Tag color="volcano">复合题</Tag> : <Tag>单题</Tag>;
      },
    },
    {
      title: '素材',
      width: 150,
      render: (_, record) => {
        const status = getResourceStatus(record);
        const needsResource = hasResources(record);
        const showGenerateButton = needsResource && status !== 'complete';

        if (status === 'none') {
          return <span>-</span>;
        }

        const config = RESOURCE_STATUS_CONFIG[status];

        return (
          <Flex gap={8} align="center">
            <Tag color={config.color}>{config.label}</Tag>
            {showGenerateButton && (
              <Button
                type="link"
                size="small"
                loading={generatingResourceId === record.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateResources(record.id);
                }}
              >
                生成
              </Button>
            )}
          </Flex>
        );
      },
    },
    // TODO: usage_count, correct_rate 字段已删除
    createActionColumn<Question>(
      (record) => (
        <>
          <Button key="preview" type="link" onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button key="detail" type="link" onClick={() => navigate(`/question/detail/${record.id}`)}>
            详情
          </Button>
          <Button key="edit" type="link" onClick={() => navigate(`/question/form/${record.id}`)}>
            编辑
          </Button>
          <DeleteButton
            key="delete"
            title="确定要删除这道题目吗？"
            onConfirm={() => handleDelete(record.id)}
            buttonProps={{ type: 'link' }}
          />
        </>
      ),
      { width: 180 },
    ),
  ];

  useEffect(() => {
    actionRef.current?.reload?.(true);
  }, [subject, grade, actionRef]);

  return (
    <>
      <ProTable<Question>
        actionRef={actionRef}
        bordered
        cardBordered
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        columns={columns}
        pagination={{ defaultPageSize: 20 }}
        scroll={{ x: 'max-content' }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        request={async ({ current, pageSize, id, name }) => {
          const res = await QuestionApi.searchQuestions({
            page: current,
            size: pageSize,
            subject,
            grade,
            id,
            name,
          });
          return {
            data: res?.data || [],
            total: res?.total || 0,
            success: true,
          };
        }}
        headerTitle={
          <Flex gap={16}>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/question/form')}>
              新建题目
            </Button>
            <Button
              danger
              size="large"
              onClick={handleBatchDeleteClick}
              disabled={selectedRowKeys.length === 0}
              loading={batchDeleteLoading}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          </Flex>
        }
      />
      <LoadingModal />
    </>
  );
}

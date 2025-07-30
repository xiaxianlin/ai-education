import React from 'react';
import { Button, Modal, Tag } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { TextbookApi } from '@/services/textbook';
import { useTextbookListModel } from '../models/page';
import { fmtTime } from '@/utils/time';

const TextbookTable: React.FC = () => {
  const { actionRef, deleteTextbook, handleAdd, handleEdit } = useTextbookListModel();

  const handleDelete = (textbook: Textbook) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除该教材吗？`,
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteTextbook(textbook.id),
    });
  };

  const columns: ProColumns<Textbook>[] = [
    {
      title: '科目',
      dataIndex: 'subject',
    },
    {
      title: '版本',
      dataIndex: 'version',
    },
    {
      title: '阶段',
      dataIndex: 'stage',
    },
    {
      title: '年级',
      dataIndex: 'grade',
    },
    {
      title: '学期',
      dataIndex: 'semester',
    },
    {
      title: '文件上传',
      dataIndex: 'name',
      render: (_, record) => (record.name ? <Tag color="success">已上传</Tag> : <Tag>未上传</Tag>),
    },
    {
      title: '单元解析',
      dataIndex: 'is_parsed',
      render: (is_parsed) => (is_parsed ? <Tag color="success">已解析</Tag> : <Tag>未解析</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (status ? <Tag color="success">启用</Tag> : <Tag>未启用</Tag>),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      width: 180,
      hideInSearch: true,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      width: 180,
      hideInSearch: true,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, record) => [
        <Button size="small" key="edit" type="link" onClick={() => handleEdit(record)}>
          编辑
        </Button>,
        <Button size="small" key="delete" type="link" danger onClick={() => handleDelete(record)}>
          删除
        </Button>,
      ],
    },
  ];

  return (
    <ProTable<Textbook>
      actionRef={actionRef}
      rowKey="id"
      search={false}
      columns={columns}
      toolbar={{
        settings: [],
        actions: [
          <Button type="primary" onClick={handleAdd}>
            新增教材
          </Button>,
        ],
      }}
      request={async () => {
        const data = await TextbookApi.search();
        return {
          data: data.data || [],
          success: true,
          total: data.total,
        };
      }}
    />
  );
};

export default TextbookTable;

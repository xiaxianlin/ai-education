import React from 'react';
import {
  ProTable,
  ProColumns,
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button, Switch } from 'antd';
import { fmtTime } from '@/utils/time';
import { TextbookApi } from '@/services/textbook';
import { useTextbookDetailModel } from '../models/page';
import { PlusOutlined } from '@ant-design/icons';
import { useTextbookKnowledgeModel } from '../models/knowledge';

export const KnowledgeView: React.FC = () => {
  const { id, units } = useTextbookDetailModel();
  const {
    actionRef,
    formProps: { form, visible, editingItem, showForm, onCancel },
    updateStatus,
    handleDelete,
    handleSubmit,
  } = useTextbookKnowledgeModel();

  const columns: ProColumns<Knowledge>[] = [
    { title: '知识点名称', width: 120, hideInSearch: true, dataIndex: 'name' },
    { title: '知识点内容', hideInSearch: true, dataIndex: 'content', ellipsis: true },
    {
      key: 'unit',
      title: '单元名称',
      valueType: 'select',
      valueEnum: units?.reduce((prev, curr) => ({ ...prev, [curr.id]: curr.name }), {}),
      renderText: (_, record) => record.course_unit?.name,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: { 1: '启用', 0: '停用' },
      width: 90,
      render: (_, record) => (
        <Switch
          checked={!!record.status}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={() => updateStatus(record)}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      hideInSearch: true,
      width: 160,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      hideInSearch: true,
      width: 160,
      renderText: (time) => fmtTime(time),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, record) => [
        <Button key="edit" type="link" onClick={() => showForm(record)}>
          编辑
        </Button>,
        <Button key="delete" type="link" danger onClick={() => handleDelete(record)}>
          删除
        </Button>,
      ],
    },
  ];

  return (
    <div className="custom-table">
      <Button
        size="small"
        type="primary"
        className="absolute right-0 top-[-48px]"
        icon={<PlusOutlined />}
        onClick={() => showForm()}
      >
        添加知识点
      </Button>
      <ProTable<Knowledge>
        form={{ style: { padding: 0, marginBlock: 8 } }}
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        scroll={{ x: 'max-content' }}
        toolbar={{ settings: [] }}
        request={async (params) => {
          const data = await TextbookApi.getKnowledges(id);
          const filtered = data.filter((item) => {
            const results = ['unit', 'status']
              .filter((key) => Boolean(params[key]))
              .map((key) => {
                const value = params[key];
                switch (key) {
                  case 'unit':
                    return item.course_unit?.id === Number(value);
                  case 'status':
                    return item.status === Number(value);
                }
              });
            return results.every(Boolean);
          });

          return { data: filtered, success: true, total: filtered.length };
        }}
        pagination={{ pageSize: 7 }}
      />
      <ModalForm<CoureSimpleForm>
        width={600}
        form={form}
        open={visible}
        title={editingItem ? '更新知识点' : '新增知识点'}
        onFinish={handleSubmit}
        modalProps={{ destroyOnClose: true, onCancel }}
        size="large"
      >
        <div className="pt-3" />
        <ProFormSelect
          name="course_unit_id"
          label="课程单元"
          placeholder="请选择课程单元"
          rules={[{ required: true }]}
          request={async () => units?.map((i) => ({ label: i.name, value: i.id }))}
        />
        <ProFormText
          name="name"
          label="知识点名称"
          placeholder="请输入知识点名称"
          rules={[{ required: true }]}
          fieldProps={{ maxLength: 100 }}
        />
        <ProFormTextArea
          name="content"
          label="知识点内容"
          placeholder="请输入知识点内容"
          rules={[{ required: true }]}
          fieldProps={{ rows: 6, maxLength: 2000 }}
        />
      </ModalForm>
    </div>
  );
};

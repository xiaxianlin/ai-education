import { createActionColumn } from '@/hooks';
import {
  ModalForm,
  ProColumns,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import React from 'react';
import { TextbookApi } from '../../api';
import { useTextbookKnowledgeModel } from '../models/knowledge';
import { useTextbookDetailModel } from '../models/page';

export const KnowledgeView: React.FC = () => {
  const { id, units } = useTextbookDetailModel();
  const {
    actionRef,
    formProps: { form, visible, item, showForm, onCancel, handleSubmit },
    handleDelete,
  } = useTextbookKnowledgeModel();

  const columns: ProColumns<Knowledge>[] = [
    { title: '知识点名称', dataIndex: 'name' },
    { title: '知识点内容', dataIndex: 'content', ellipsis: true },
    {
      key: 'unit',
      title: '单元名称',
      dataIndex: 'unit_id',
      valueType: 'select',
      valueEnum: units?.reduce((prev, curr) => ({ ...prev, [curr.id]: curr.name }), {}),
      renderText: (unit_id) => units?.find((u) => u.id === unit_id)?.name || '',
    },
    createActionColumn<Knowledge>(
      (record) => (
        <>
          <Button key="edit" type="link" onClick={() => showForm(record)}>
            编辑
          </Button>
          <Button key="delete" type="link" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </>
      ),
      { width: 120 },
    ),
  ];

  return (
    <div>
      <ProTable<Knowledge>
        form={{ style: { padding: 0, marginBlock: 8 } }}
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={false}
        scroll={{ x: 'max-content' }}
        toolbar={{ settings: [] }}
        request={async (params) => {
          const data = await TextbookApi.getTextbookKnowledges(id, { page: params.current, size: params.pageSize });
          return { data: data.data ?? [], success: true, total: data.total };
        }}
        pagination={{ pageSize: 10 }}
        headerTitle={
          <Button type="primary" onClick={() => showForm()}>
            添加知识点
          </Button>
        }
      />
      <ModalForm<CreateKnowledgeRequest | UpdateKnowledgeRequest>
        width={600}
        form={form}
        open={visible}
        title={item ? '更新知识点' : '新增知识点'}
        onFinish={handleSubmit}
        modalProps={{ destroyOnClose: true, onCancel }}
        size="large"
      >
        <div className="pt-3" />
        <ProFormSelect
          name="unit_id"
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

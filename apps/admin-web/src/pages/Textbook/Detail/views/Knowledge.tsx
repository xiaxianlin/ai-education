import React from 'react';
import {
  ProTable,
  ProColumns,
  ModalForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import { adminApi } from '@/lib/api';
import { useTextbookDetailModel } from '../models/page';
import { useTextbookKnowledgeModel } from '../models/knowledge';
import { createActionColumn } from '@/hooks';

export const KnowledgeView: React.FC = () => {
  const { id, units } = useTextbookDetailModel();
  const {
    actionRef,
    formProps: { form, visible, item, showForm, onCancel, handleSubmit },
    handleDelete,
  } = useTextbookKnowledgeModel();
  console.log(units);

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
          const data = (await (adminApi as any).getTextbookKnowledges?.(id)) || [];
          const filtered = data.filter((item: any) => {
            const results = ['unit']
              .filter((key) => Boolean(params[key]))
              .map((key) => {
                const value = params[key];
                switch (key) {
                  case 'unit':
                    return item.unit_id === Number(value);
                }
              });
            return results.every(Boolean);
          });

          return { data: filtered, success: true, total: filtered.length };
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

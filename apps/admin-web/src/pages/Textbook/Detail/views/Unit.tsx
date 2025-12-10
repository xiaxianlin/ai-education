import React from 'react';
import { ProTable, ProColumns, ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { adminApi } from '@/lib/api';
import { useTextbookDetailModel } from '../models/page';
import { useTextbookUnitModel } from '../models/unit';
export const UnitView: React.FC = () => {
  const { id, setUnits } = useTextbookDetailModel();
  const {
    actionRef,
    formProps: { instance, visible, edited, showForm, onCancel },
    handleDelete,
    handleSubmit,
  } = useTextbookUnitModel();

  const columns: ProColumns<Unit>[] = [
    { title: 'ID', dataIndex: 'id' },
    { title: '单元名称', dataIndex: 'name' },
    { title: '单元内容', dataIndex: 'content', ellipsis: true },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => showForm(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ProTable<Unit>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        scroll={{ x: 'max-content' }}
        toolbar={{ settings: [] }}
        request={async () => {
          const data = await adminApi.getTextbookUnits(id);
          setUnits(data);
          return { data, success: true, total: data.length };
        }}
        pagination={{ pageSize: 10 }}
        headerTitle={
          <Button type="primary" onClick={() => showForm()}>
            添加单元
          </Button>
        }
      />
      <ModalForm<CreateUnitRequest | UpdateUnitRequest>
        width={600}
        form={instance}
        open={visible}
        title={edited ? '更新单元' : '新增单元'}
        onFinish={handleSubmit}
        modalProps={{ destroyOnHidden: true, onCancel }}
        size="large"
      >
        <div className="pt-3" />
        <ProFormText
          name="name"
          label="单元名称"
          placeholder="请输入单元名称"
          rules={[{ required: true }]}
          fieldProps={{ maxLength: 100 }}
        />
        <ProFormTextArea
          name="content"
          label="单元内容"
          placeholder="请输入单元内容"
          rules={[{ required: true }]}
          fieldProps={{ rows: 6, maxLength: 2000 }}
        />
      </ModalForm>
    </div>
  );
};

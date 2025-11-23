import React from 'react';
import {
  ProTable,
  ProColumns,
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button } from 'antd';
import { fmtTime } from '@/utils/time';
import { TextbookApi } from '@/services/textbook';
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
        onClick={() => showForm()}
      >
        添加单元
      </Button>
      <ProTable<Unit>
        size="small"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        columns={columns}
        scroll={{ x: 'max-content' }}
        toolbar={{ settings: [] }}
        request={async () => {
          const data = await TextbookApi.getUnits(id);
          setUnits(data);
          return { data, success: true, total: data.length };
        }}
        pagination={{ pageSize: 10 }}
      />
      <ModalForm<TextbookContentForm>
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

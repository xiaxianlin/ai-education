import React from 'react';
import {
  ProTable,
  ProColumns,
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Modal, Spin, Space } from 'antd';
import { fmtTime } from '@/utils/time';
import { TextbookApi } from '@/services/textbook';
import { CourseUnitApi } from '@/services/unit';
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

  const handleGenerateQuestions = async (unit: Unit) => {
    Modal.confirm({
      centered: true,
      title: '生成题目',
      content: `确定要为单元 "${unit.name}" 生成题目吗？生成过程可能需要一些时间，请耐心等待。`,
      onOk: async () => {
        // 显示全局 loading 弹窗
        const hide = Modal.info({
          centered: true,
          title: '正在生成题目',
          content: React.createElement(
            'div',
            { style: { textAlign: 'center', padding: '20px 0' } },
            React.createElement(Spin, { size: 'large' }),
            React.createElement(
              'div',
              { style: { color: '#666', marginTop: 16 } },
              `正在为单元 "${unit.name}" 生成题目，请稍候...`,
            ),
          ),
          okButtonProps: { style: { display: 'none' } },
          closable: false,
          maskClosable: false,
          width: 400,
        });

        try {
          await CourseUnitApi.generateQuestions(unit.id);
          hide.destroy();
          Modal.success({
            centered: true,
            title: '生成成功',
            content: `单元 "${unit.name}" 的题目已生成完成！`,
          });
        } catch (error: any) {
          hide.destroy();
          Modal.error({
            centered: true,
            title: '生成失败',
            content: error?.message || '题目生成失败，请稍后重试',
          });
        }
      },
    });
  };

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
          <Button type="link" onClick={() => handleGenerateQuestions(record)}>
            生成题目
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
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

import { useRef, useState } from 'react';
import { Form, message } from 'antd';
import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '@/services/textbook';
import { ActionType } from '@ant-design/pro-components';

const useContainer = () => {
  const [form] = Form.useForm();
  const [editId, setEditId] = useState<number>();
  const [visible, setVisible] = useState(false);
  const actionRef = useRef<ActionType>();

  const { data: versions } = useRequest(TextbookApi.getVersions);
  const { data: subjects } = useRequest(TextbookApi.getSubjects);

  const { runAsync: deleteTextbook } = useRequest(TextbookApi.delete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: TextbookFormModel) => {
      if (editId) {
        await TextbookApi.update(editId, values);
      } else {
        await TextbookApi.create(values);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(editId ? '更新成功' : '新增成功');
        actionRef.current?.reload();
        handleCancel();
      },
    },
  );

  const handleCancel = () => {
    form.resetFields();
    setEditId(undefined);
    setVisible(false);
  };

  const handleAdd = () => {
    setEditId(undefined);
    setVisible(true);
  };

  const handleEdit = (item: Textbook) => {
    form.setFieldsValue({ ...item });
    setEditId(item.id);
    setVisible(true);
  };

  return {
    form,
    isEdit: !!editId,
    visible,
    versions,
    subjects,
    actionRef,
    deleteTextbook,
    handleEdit,
    handleCancel,
    handleAdd,
    handleSubmit,
  };
};

export const TextbookListModel = createContainer(useContainer);
export const useTextbookListModel = TextbookListModel.useContainer;

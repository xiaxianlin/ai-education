import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { TextbookApi } from '@/services/textbook';
import { message, Modal } from 'antd';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const form = useSimpleForm<TextbookForm, Textbook>({
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync } = useRequest(TextbookApi.toggleStatus, {
    manual: true,
    onSuccess: (_, [_id, status]) => {
      message.success(status ? '启用成功' : '停用成功');
      actionRef.current?.reload();
    },
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: TextbookForm) => {
      if (form.edited) {
        await TextbookApi.update(form.edited.id, values);
      } else {
        await TextbookApi.create(values);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(form.edited ? '更新成功' : '新增成功');
        form.onCancel();
        form.onSubmit();
      },
    },
  );

  const updateStatus = (textbook: Textbook) => {
    Modal.confirm({
      centered: true,
      title: '状态变更',
      content: `确定要${textbook.status ? '停用' : '启用'}该教材吗？`,
      onOk: () => runAsync(textbook.id, textbook.status ? 0 : 1),
    });
  };

  return {
    ...form,
    actionRef,
    updateStatus,
    handleSubmit,
  };
};

export const TextbookListModel = createContainer(useContainer);
export const useTextbookListModel = TextbookListModel.useContainer;

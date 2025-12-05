import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { adminApi } from '@ai-education/shared-api-client';
import { message, Modal } from 'antd';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const form = useSimpleForm<TextbookForm, Textbook>({
    onSubmit: () => actionRef.current?.reload(),
  });


  const { runAsync: handleSubmit } = useRequest(
    async (values: TextbookForm) => {
      if (form.edited) {
        await adminApi.updateTextbook(form.edited.id, values);
      } else {
        await adminApi.createTextbook(values);
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


  return {
    ...form,
    actionRef,
    handleSubmit,
  };
};

export const TextbookListModel = createContainer(useContainer);
export const useTextbookListModel = TextbookListModel.useContainer;

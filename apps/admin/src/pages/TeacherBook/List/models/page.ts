import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { TeacherBookApi } from '@/services/teacher_book';
import { message } from 'antd';

const useContainer = () => {
  const actionRef = useRef<ActionType>();
  const form = useSimpleForm<TeacherBookForm, TeacherBook>({
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: TeacherBookForm) => {
      if (form.edited) {
        await TeacherBookApi.update(form.edited.id, values);
      } else {
        await TeacherBookApi.create(values);
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

export const TeacherBookListModel = createContainer(useContainer);
export const useTeacherBookListModel = TeacherBookListModel.useContainer;

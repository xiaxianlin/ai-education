import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const [subject, setSubject] = useState('英语');
  const [grade, setGrade] = useState(1);
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<SaveTeacherBookRequest, TeacherBook>({
    service: async (values, item) => {
      if (item) {
        await adminApi.updateTeacherBook(item.id, values);
      } else {
        await adminApi.createTeacherBook(values);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  useEffect(() => {
    actionRef.current?.reload();
  }, [subject, grade]);

  return {
    subject,
    grade,
    setSubject,
    setGrade,
    formProps,
    actionRef,
  };
};

export const TeacherBookListModel = createContainer(useContainer);
export const useTeacherBookListModel = TeacherBookListModel.useContainer;

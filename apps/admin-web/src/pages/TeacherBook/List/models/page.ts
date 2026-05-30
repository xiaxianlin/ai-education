import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import type { TableActionRef } from '@/components/ui';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { TeacherBookApi } from '../../api';

const useContainer = () => {
  const { subject, grade, setSubject, setGrade } = useInitialStateModel();

  const actionRef = useRef<TableActionRef>();
  const formProps = useSimpleForm<SaveTeacherBookRequest, TeacherBook>({
    service: async (values, item) => {
      values.subject = subject;
      values.grade = grade;
      if (item) {
        await TeacherBookApi.updateTeacherBook(item.id, values);
      } else {
        await TeacherBookApi.createTeacherBook(values);
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

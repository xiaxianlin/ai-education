import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { TeacherBookApi } from '../../api';

const useContainer = () => {
  const { subject, grade } = useInitialStateModel();

  const actionRef = useRef<ActionType>();
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

  return { subject, grade, formProps, actionRef };
};

export const TeacherBookListModel = createContainer(useContainer);
export const useTeacherBookListModel = TeacherBookListModel.useContainer;

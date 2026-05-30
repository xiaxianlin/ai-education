import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import type { TableActionRef } from '@/components/ui';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '../../api';

const useContainer = () => {
  const { subject, grade, setSubject, setGrade } = useInitialStateModel();

  const actionRef = useRef<TableActionRef>();
  const formProps = useSimpleForm<SaveTextbookRequest, Textbook>({
    service: async (values, item) => {
      values.subject = subject;
      values.grade = grade;
      if (item) {
        await TextbookApi.updateTextbook(item.id, values);
      } else {
        await TextbookApi.createTextbook(values);
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
    actionRef,
    formProps,
  };
};

export const TextbookListModel = createContainer(useContainer);
export const useTextbookListModel = TextbookListModel.useContainer;

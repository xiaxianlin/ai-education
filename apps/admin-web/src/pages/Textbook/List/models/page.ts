import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '../../api';

const useContainer = () => {
  const { subject, grade } = useInitialStateModel();

  const actionRef = useRef<ActionType>();
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

  return { subject, grade, actionRef, formProps };
};

export const TextbookListModel = createContainer(useContainer);
export const useTextbookListModel = TextbookListModel.useContainer;

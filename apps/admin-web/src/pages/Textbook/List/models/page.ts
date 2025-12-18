import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const [subject, setSubject] = useState('英语');
  const [grade, setGrade] = useState(1);
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<SaveTextbookRequest, Textbook>({
    service: async (values, item) => {
      if (item) {
        await adminApi.updateTextbook(item.id, values);
      } else {
        await adminApi.createTextbook(values);
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

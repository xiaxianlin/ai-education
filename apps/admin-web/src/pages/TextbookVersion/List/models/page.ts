import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import type { TableActionRef } from '@/components/ui';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { TextbookVersionApi } from '../../api';

const useContainer = () => {
  const { subject, setSubject } = useInitialStateModel();

  const actionRef = useRef<TableActionRef>();
  const formProps = useSimpleForm<SaveTextbookVersionRequest, TextbookVersion>({
    service: async (values, item) => {
      values.subject = subject;
      if (item) {
        await TextbookVersionApi.updateTextbookVersion(item.id, values);
      } else {
        await TextbookVersionApi.createTextbookVersion(values);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  useEffect(() => {
    actionRef.current?.reload();
  }, [subject]);

  return {
    subject,
    setSubject,
    actionRef,
    formProps,
  };
};

export const TextbookVersionListModel = createContainer(useContainer);
export const useTextbookVersionListModel = TextbookVersionListModel.useContainer;

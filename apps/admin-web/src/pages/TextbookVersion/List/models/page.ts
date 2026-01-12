import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { TextbookVersionApi } from '../../api';

const useContainer = () => {
  const { subject } = useInitialStateModel();

  const actionRef = useRef<ActionType>();
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

  return { subject, actionRef, formProps };
};

export const TextbookVersionListModel = createContainer(useContainer);
export const useTextbookVersionListModel = TextbookVersionListModel.useContainer;

import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { AbilityApi } from '../../api';
import type {
  CreateAbilityAtomicRequest,
  UpdateAbilityAtomicRequest,
} from '../../api';

const useContainer = () => {
  const { subject, grade } = useInitialStateModel();
  const [domainCode, setDomainCode] = useState<string>();

  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<
    CreateAbilityAtomicRequest | UpdateAbilityAtomicRequest,
    AbilityAtomic
  >({
    service: async (values, item) => {
      if (item) {
        await AbilityApi.updateAtomic(
          item.id,
          values as UpdateAbilityAtomicRequest
        );
      } else {
        await AbilityApi.createAtomic({
          ...values,
          subject,
          grade,
        } as CreateAbilityAtomicRequest);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  useEffect(() => {
    actionRef.current?.reload();
  }, [subject, grade, domainCode]);

  return { subject, grade, domainCode, setDomainCode, actionRef, formProps };
};

export const AtomicListModel = createContainer(useContainer);
export const useAtomicListModel = AtomicListModel.useContainer;

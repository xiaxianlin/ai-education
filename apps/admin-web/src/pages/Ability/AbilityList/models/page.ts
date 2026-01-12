import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { AbilityApi } from '../../api';
import type {
  CreateAbilityDomainRequest,
  UpdateAbilityDomainRequest,
} from '../../api';

const useContainer = () => {
  const { subject } = useInitialStateModel();

  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<
    CreateAbilityDomainRequest | UpdateAbilityDomainRequest,
    AbilityDomain
  >({
    service: async (values, item) => {
      if (item) {
        await AbilityApi.updateDomain(item.id, values as UpdateAbilityDomainRequest);
      } else {
        await AbilityApi.createDomain({
          ...values,
          subject,
        } as CreateAbilityDomainRequest);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  useEffect(() => {
    actionRef.current?.reload();
  }, [subject]);

  return { subject, actionRef, formProps };
};

export const AbilityListModel = createContainer(useContainer);
export const useAbilityListModel = AbilityListModel.useContainer;

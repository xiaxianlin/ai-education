import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';

const useContainer = () => {
  const actionRef = useRef<ActionType>();

  return {
    actionRef,
  };
};

export const PromptListModel = createContainer(useContainer);
export const usePromptListModel = PromptListModel.useContainer;


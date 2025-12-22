import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { message, Modal } from 'antd';
import { PromptApi } from '../../api';

const useContainer = () => {
  const [searchParams] = useSearchParams();
  const promptId = searchParams.get('prompt_id') ? Number(searchParams.get('prompt_id')) : undefined;
  const actionRef = useRef<ActionType>();

  const handlePublish = async (versionId: number) => {
    Modal.confirm({
      title: '发布确认',
      content: '确定要发布此版本吗？发布后将替换当前使用的版本。',
      onOk: async () => {
        try {
          await PromptApi.publishPromptVersion(versionId, '');
          message.success('发布成功');
          actionRef.current?.reload();
        } catch (error) {
          message.error('发布失败');
        }
      },
    });
  };

  return {
    actionRef,
    promptId,
    handlePublish,
  };
};

export const PromptVersionListModel = createContainer(useContainer);
export const usePromptVersionListModel = PromptVersionListModel.useContainer;

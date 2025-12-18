import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { adminApi } from '@/lib/api';
import { useTextbookDetailModel } from './page';
import { useAntdApp } from '@/lib/antdApp';

const useContainer = () => {
  const { message, modal } = useAntdApp();
  const { id } = useTextbookDetailModel();
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<CreateKnowledgeRequest | UpdateKnowledgeRequest, Knowledge>({
    service: async (values, item) => {
      if (item) {
        await adminApi.updateKnowledge(item.id, values as UpdateKnowledgeRequest);
      } else {
        await adminApi.createKnowledge({ ...values, textbook_id: Number(id) } as CreateKnowledgeRequest);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: deleteUnit } = useRequest(adminApi.deleteKnowledge, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const handleDelete = (knowledge: Knowledge) => {
    modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除知识点「${knowledge.name}」吗？`,
      okType: 'danger',
      onOk: () => {
        deleteUnit(knowledge.id);
      },
    });
  };

  return {
    formProps,
    actionRef,
    handleDelete,
  };
};

export const TextbookKnowledgeModel = createContainer(useContainer);
export const useTextbookKnowledgeModel = TextbookKnowledgeModel.useContainer;

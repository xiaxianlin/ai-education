import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { useTextbookDetailModel } from './page';
import { TextbookApi } from '../../api';

const useContainer = () => {
  const { id } = useTextbookDetailModel();
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<CreateKnowledgeRequest | UpdateKnowledgeRequest, Knowledge>({
    service: async (values, item) => {
      if (item) {
        await TextbookApi.updateKnowledge(item.id, values as UpdateKnowledgeRequest);
      } else {
        await TextbookApi.createKnowledge({ ...values, textbook_id: Number(id) } as CreateKnowledgeRequest);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: deleteUnit } = useRequest(TextbookApi.deleteKnowledge, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const handleDelete = (knowledge: Knowledge) => {
    Modal.confirm({
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

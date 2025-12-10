import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { adminApi } from '@/lib/api';
import { useTextbookDetailModel } from './page';

const useContainer = () => {
  const { id } = useTextbookDetailModel();
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<CreateKnowledgeRequest | UpdateKnowledgeRequest, Knowledge>();

  const { runAsync: deleteUnit } = useRequest(adminApi.deleteKnowledge, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: CreateKnowledgeRequest | UpdateKnowledgeRequest) => {
      if (formProps.edited) {
        await adminApi.updateKnowledge(formProps.edited.id, values as UpdateKnowledgeRequest);
      } else {
        await adminApi.createKnowledge({ ...values, textbook_id: Number(id) } as CreateKnowledgeRequest);
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(formProps.edited?.id ? '更新成功' : '新增成功');
        formProps.onCancel?.();
        actionRef.current?.reload();
      },
    },
  );

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
    handleSubmit,
  };
};

export const TextbookKnowledgeModel = createContainer(useContainer);
export const useTextbookKnowledgeModel = TextbookKnowledgeModel.useContainer;

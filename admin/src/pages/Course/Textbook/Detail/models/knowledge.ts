import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { KnowledgeApi } from '@/services/knowledge';
import { useTextbookDetailModel } from './page';

const useContainer = () => {
  const { id } = useTextbookDetailModel();
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<CoureSimpleForm, Knowledge>();

  const { runAsync: deleteUnit } = useRequest(KnowledgeApi.delete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: CoureSimpleForm) => {
      if (formProps.editingItem) {
        await KnowledgeApi.update(formProps.editingItem.id, values);
      } else {
        await KnowledgeApi.create({ ...values, textbook_id: id });
      }
    },
    {
      manual: true,
      onSuccess: () => {
        message.success(formProps.editingItem?.id ? '更新成功' : '新增成功');
        formProps.onCancel?.();
        actionRef.current?.reload();
      },
    },
  );

  const { runAsync } = useRequest(KnowledgeApi.toggleStatus, {
    manual: true,
    onSuccess: (_, [_id, status]) => {
      message.success(status ? '启用成功' : '停用成功');
      actionRef.current?.reload();
    },
  });

  const updateStatus = (knowledge: Knowledge) => {
    Modal.confirm({
      centered: true,
      title: '状态变更',
      content: `确定要${knowledge.status ? '停用' : '启用'}知识点「${knowledge.name}」吗？`,
      onOk: () => runAsync(knowledge.id, knowledge.status ? 0 : 1),
    });
  };

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
    updateStatus,
    handleDelete,
    handleSubmit,
  };
};

export const TextbookKnowledgeModel = createContainer(useContainer);
export const useTextbookKnowledgeModel = TextbookKnowledgeModel.useContainer;

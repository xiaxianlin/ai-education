import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { adminApi } from '@ai-education/shared-api-client';
import { useTextbookDetailModel } from './page';

const useContainer = () => {
  const { id } = useTextbookDetailModel();
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<TextbookContentForm, Unit>();

  const { runAsync: deleteUnit } = useRequest(adminApi.deleteUnit, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: TextbookContentForm) => {
      if (formProps.edited) {
        await adminApi.updateUnit(formProps.edited.id, values);
      } else {
        await adminApi.createUnit({ ...values, textbook_id: id });
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

  const handleDelete = (unit: Unit) => {
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除单元 "${unit.name}" 吗？`,
      okType: 'danger',
      onOk: () => {
        deleteUnit(unit.id);
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

export const TextbookUnitModel = createContainer(useContainer);
export const useTextbookUnitModel = TextbookUnitModel.useContainer;

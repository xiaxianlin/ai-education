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
  const formProps = useSimpleForm<CreateUnitRequest | UpdateUnitRequest, Unit>({
    service: async (values, item) => {
      if (item) {
        await adminApi.updateUnit(item.id, values as UpdateUnitRequest);
      } else {
        await adminApi.createUnit({ ...values, textbook_id: Number(id) } as CreateUnitRequest);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: deleteUnit } = useRequest(adminApi.deleteUnit, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

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
  };
};

export const TextbookUnitModel = createContainer(useContainer);
export const useTextbookUnitModel = TextbookUnitModel.useContainer;

import type { TableActionRef } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { useTextbookDetailModel } from './page';
import { TextbookApi } from '../../api';

const useContainer = () => {
  const { id } = useTextbookDetailModel();
  const actionRef = useRef<TableActionRef>();
  const formProps = useSimpleForm<CreateUnitRequest | UpdateUnitRequest, Unit>({
    service: async (values, item) => {
      if (item) {
        await TextbookApi.updateUnit(item.id, values as UpdateUnitRequest);
      } else {
        await TextbookApi.createUnit({ ...values, textbook_id: Number(id) } as CreateUnitRequest);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: deleteUnit } = useRequest(TextbookApi.deleteUnit, {
    manual: true,
    onSuccess: () => {
      toast.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const handleDelete = (unit: Unit) => {
    if (window.confirm(`确定要删除单元 "${unit.name}" 吗？`)) {
      deleteUnit(unit.id);
    }
  };

  return {
    formProps,
    actionRef,
    handleDelete,
  };
};

export const TextbookUnitModel = createContainer(useContainer);
export const useTextbookUnitModel = TextbookUnitModel.useContainer;

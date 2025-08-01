import { useRef } from 'react';
import { createContainer } from 'unstated-next';
import { ActionType } from '@ant-design/pro-components';
import { useSimpleForm } from '@/hooks';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { CourseUnitApi } from '@/services/course_unit';
import { useTextbookDetailModel } from './page';

const useContainer = () => {
  const { id } = useTextbookDetailModel();
  const actionRef = useRef<ActionType>();
  const formProps = useSimpleForm<CoureSimpleForm, CourseUnit>();

  const { runAsync: deleteUnit } = useRequest(CourseUnitApi.delete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      actionRef.current?.reload();
    },
  });

  const { runAsync: handleSubmit } = useRequest(
    async (values: CoureSimpleForm) => {
      if (formProps.editingItem) {
        await CourseUnitApi.update(formProps.editingItem.id, values);
      } else {
        await CourseUnitApi.create({ ...values, textbook_id: id });
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

  const { runAsync } = useRequest(CourseUnitApi.toggleStatus, {
    manual: true,
    onSuccess: (_, [_id, status]) => {
      message.success(status ? '启用成功' : '停用成功');
      actionRef.current?.reload();
    },
  });

  const updateStatus = (unit: CourseUnit) => {
    Modal.confirm({
      centered: true,
      title: '状态变更',
      content: `确定要${unit.status ? '停用' : '启用'}单元「${unit.name}」吗？`,
      onOk: () => runAsync(unit.id, unit.status ? 0 : 1),
    });
  };

  const handleDelete = (unit: CourseUnit) => {
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
    updateStatus,
    handleDelete,
    handleSubmit,
  };
};

export const TextbookUnitModel = createContainer(useContainer);
export const useTextbookUnitModel = TextbookUnitModel.useContainer;

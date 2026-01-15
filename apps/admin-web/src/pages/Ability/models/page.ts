import { useDelete, useExport, useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useMemoizedFn, useRequest } from 'ahooks';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import type { CreateAbilityRequest, UpdateAbilityRequest } from '../api';
import { AbilityApi } from '../api';

const useContainer = () => {
  const { subject, grade, setSubject, setGrade } = useInitialStateModel();

  // 列表页相关状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const actionRef = useRef<ActionType>();

  // 表单处理
  const formProps = useSimpleForm<CreateAbilityRequest | UpdateAbilityRequest, Ability>({
    service: async (values, item) => {
      if (item) {
        // 更新
        await AbilityApi.updateAbility(item.id, values as UpdateAbilityRequest);
      } else {
        // 创建
        await AbilityApi.createAbility({ ...values, subject, grade } as CreateAbilityRequest);
      }
    },
    onSubmit: () => actionRef.current?.reload?.(),
  });

  // 批量删除相关逻辑
  const { runAsync: batchDeleteAbilities, loading: batchDeleteLoading } = useRequest(
    (ids: number[]) => AbilityApi.batchDeleteAbilities(ids),
    {
      manual: true,
      onSuccess: (res) => {
        message.success(`成功删除 ${res.deleted_count} 个能力`);
        setSelectedRowKeys([]);
        actionRef.current?.reload?.();
      },
      onError: (error: any) => {
        message.error(error?.message || '批量删除失败');
      },
    },
  );

  // 导出能力数据
  const { handleExport, exporting } = useExport(
    () =>
      AbilityApi.exportAbilitiesByGrade({
        subject,
        grade,
      }),
    {
      successMessage: '能力数据导出成功',
      errorMessage: '导出失败',
      loadingMessage: '正在导出能力数据...',
      defaultFilename: `ability-${subject}-grade${grade}`,
      fileExtension: 'json',
    },
  );

  // 导入能力数据（纯业务逻辑，不包含弹窗确认）
  const { runAsync: importAbilities, loading: importing } = useRequest(
    async (file: File) => {
      message.loading({ content: '正在导入能力数据...', key: 'import', duration: 0 });

      const result = await AbilityApi.importAbilitiesByGrade(file, {
        subject,
        grade,
      });

      message.destroy('import');
      message.success(`导入成功！已删除 ${result.deleted_count} 条旧数据，新增 ${result.created_count} 条数据`);

      // 刷新列表
      actionRef.current?.reload?.();
    },
    {
      manual: true,
      onError: (error: any) => {
        message.destroy('import');
        message.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
      },
    },
  );

  // 删除相关逻辑
  const { handleDelete } = useDelete(AbilityApi.deleteAbility, {
    onSuccess: () => actionRef.current?.reload?.(),
  });

  const deleteAbility = useMemoizedFn((id: number) => {
    handleDelete(id);
  });

  // 验证文件类型
  const validateFile = useMemoizedFn((file: File): boolean => {
    if (!file.name.endsWith('.json')) {
      message.error('只支持 JSON 格式文件');
      return false;
    }
    return true;
  });

  useEffect(() => {
    actionRef.current?.reload?.();
  }, [subject, grade, actionRef]);

  return {
    subject,
    grade,
    setSubject,
    setGrade,
    formProps,
    actionRef,
    // 列表页相关
    exporting,
    importing,
    selectedRowKeys,
    setSelectedRowKeys,
    deleteAbility,
    batchDeleteAbilities,
    batchDeleteLoading,
    handleExport,
    importAbilities,
    validateFile,
  };
};

export const AbilityModel = createContainer(useContainer);
export const useAbilityModel = AbilityModel.useContainer;

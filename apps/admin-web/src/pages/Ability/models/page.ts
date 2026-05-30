import type { TableActionRef } from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { useMemoizedFn, useRequest } from 'ahooks';
import { Key, useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import type { CreateAbilityRequest, UpdateAbilityRequest } from '../api';
import { AbilityApi } from '../api';

const useContainer = () => {
  const { subject, grade, setSubject, setGrade } = useInitialStateModel();

  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [exporting, setExporting] = useState(false);
  const actionRef = useRef<TableActionRef>();

  const formProps = useSimpleForm<CreateAbilityRequest | UpdateAbilityRequest, Ability>({
    service: async (values, item) => {
      if (item) {
        await AbilityApi.updateAbility(item.id, values as UpdateAbilityRequest);
      } else {
        await AbilityApi.createAbility({ ...values, subject, grade } as CreateAbilityRequest);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  const { runAsync: batchDeleteAbilities, loading: batchDeleteLoading } = useRequest(
    (ids: number[]) => AbilityApi.batchDeleteAbilities(ids),
    {
      manual: true,
      onSuccess: (res) => {
        toast.success(`成功删除 ${res.deleted_count} 个能力`);
        setSelectedRowKeys([]);
        actionRef.current?.reload();
      },
      onError: (error: any) => {
        toast.error(error?.message || '批量删除失败');
      },
    },
  );

  const handleExport = useMemoizedFn(async () => {
    try {
      setExporting(true);
      const blob = await AbilityApi.exportAbilitiesByGrade({
        subject,
        grade,
      });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ability-${subject}-grade${grade}-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('能力数据导出成功');
    } catch (error) {
      toast.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  });

  const { runAsync: importAbilities, loading: importing } = useRequest(
    async (file: File) => {
      const result = await AbilityApi.importAbilitiesByGrade(file, {
        subject,
        grade,
      });

      toast.success(`导入成功！已删除 ${result.deleted_count} 条旧数据，新增 ${result.created_count} 条数据`);
      actionRef.current?.reload();
    },
    {
      manual: true,
      onError: (error: any) => {
        toast.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
      },
    },
  );

  const { runAsync: handleDelete } = useRequest(AbilityApi.deleteAbility, {
    manual: true,
    onSuccess: () => {
      toast.success('删除成功');
      actionRef.current?.reload();
    },
    onError: (error: any) => {
      toast.error(error?.message || '删除失败');
    },
  });

  const deleteAbility = useMemoizedFn((id: number) => {
    handleDelete(id);
  });

  const validateFile = useMemoizedFn((file: File): boolean => {
    if (!file.name.endsWith('.json')) {
      toast.error('只支持 JSON 格式文件');
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

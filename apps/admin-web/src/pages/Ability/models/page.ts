import { useDelete } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { useMemoizedFn, useRequest } from 'ahooks';
import { message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import type {
  CreateAbilityRequest,
  UpdateAbilityRequest,
} from '../api';
import { AbilityApi } from '../api';

// 只支持小学阶段（1-6年级）
const PRIMARY_GRADES = [1, 2, 3, 4, 5, 6];

const useContainer = () => {
  // 获取初始学科，如果不在 Provider 内则使用默认值
  const initialState = useInitialStateModel();
  const initialSubject = initialState?.subject;
  
  const [subject, setSubject] = useState<string>(initialSubject || '语文');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [loading, setLoading] = useState(false);
  const [formItem, setFormItem] = useState<Ability | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  
  // 列表页相关状态
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载能力列表
  const loadAbilities = useMemoizedFn(async (subj: string, grade: number) => {
    setLoading(true);
    try {
      const data = await AbilityApi.searchAbilities({
        subject: subj,
        grade,
      });
      setAbilities(data);
    } catch (error) {
      console.error('加载能力列表失败:', error);
    } finally {
      setLoading(false);
    }
  });

  // 当学科或年级变化时重新加载
  useEffect(() => {
    loadAbilities(subject, selectedGrade);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, selectedGrade]);

  const showForm = (item?: Ability) => {
    setFormItem(item || null);
    setFormVisible(true);
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setFormItem(null);
  };

  const handleFormSubmit = async (values: CreateAbilityRequest | UpdateAbilityRequest) => {
    if (formItem) {
      // 更新
      await AbilityApi.updateAbility(
        formItem.id,
        values as UpdateAbilityRequest
      );
    } else {
      // 创建
      await AbilityApi.createAbility({
        ...values,
        subject,
        grade: selectedGrade,
      } as CreateAbilityRequest);
    }
    
    // 重新加载能力列表
    await loadAbilities(subject, selectedGrade);
    
    handleFormCancel();
  };

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    setSelectedGrade(1); // 切换学科时重置到一年级
  };

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
  };

  // 删除相关逻辑
  const { handleDelete } = useDelete(AbilityApi.deleteAbility, {
    onSuccess: () => loadAbilities(subject, selectedGrade),
  });

  const deleteAbility = useMemoizedFn((id: number) => {
    handleDelete(id);
  });

  // 批量删除相关逻辑
  const { runAsync: batchDeleteAbilities, loading: batchDeleteLoading } = useRequest(
    (ids: number[]) => AbilityApi.batchDeleteAbilities(ids),
    {
      manual: true,
      onSuccess: (res) => {
        message.success(`成功删除 ${res.deleted_count} 个能力`);
        setSelectedRowKeys([]);
        loadAbilities(subject, selectedGrade);
      },
      onError: (error: any) => {
        message.error(error?.message || '批量删除失败');
      },
    }
  );

  // 导出能力数据
  const handleExport = useMemoizedFn(async () => {
    try {
      setExporting(true);
      message.loading({ content: '正在导出能力数据...', key: 'export', duration: 0 });

      const blob = await AbilityApi.exportAbilitiesByGrade({
        subject,
        grade: selectedGrade,
      });

      // 生成文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `ability-${subject}-grade${selectedGrade}-${timestamp}.json`;

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放 URL 对象
      URL.revokeObjectURL(url);

      message.destroy('export');
      message.success('能力数据导出成功');
    } catch (error) {
      message.destroy('export');
      message.error('导出失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setExporting(false);
    }
  });

  // 导入能力数据
  const handleImport = useMemoizedFn(() => {
    fileInputRef.current?.click();
  });

  // 导入能力数据（纯业务逻辑，不包含弹窗确认）
  const importAbilities = useMemoizedFn(async (file: File) => {
    try {
      setImporting(true);
      message.loading({ content: '正在导入能力数据...', key: 'import', duration: 0 });

      const result = await AbilityApi.importAbilitiesByGrade(file, {
        subject,
        grade: selectedGrade,
      });

      message.destroy('import');
      message.success(
        `导入成功！已删除 ${result.deleted_count} 条旧数据，新增 ${result.created_count} 条数据`
      );

      // 刷新列表
      loadAbilities(subject, selectedGrade);

      // 清空文件选择
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      message.destroy('import');
      message.error('导入失败：' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setImporting(false);
    }
  });

  // 验证文件类型
  const validateFile = useMemoizedFn((file: File): boolean => {
    if (!file.name.endsWith('.json')) {
      message.error('只支持 JSON 格式文件');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return false;
    }
    return true;
  });

  return {
    subject,
    selectedGrade,
    abilities,
    loading,
    formVisible,
    formItem,
    showForm,
    handleFormCancel,
    handleFormSubmit,
    handleSubjectChange,
    handleGradeChange,
    loadAbilities,
    PRIMARY_GRADES,
    // 列表页相关
    exporting,
    importing,
    selectedRowKeys,
    setSelectedRowKeys,
    fileInputRef,
    deleteAbility,
    batchDeleteAbilities,
    batchDeleteLoading,
    handleExport,
    handleImport,
    importAbilities,
    validateFile,
  };
};

export const AbilityModel = createContainer(useContainer);
export const useAbilityModel = AbilityModel.useContainer;

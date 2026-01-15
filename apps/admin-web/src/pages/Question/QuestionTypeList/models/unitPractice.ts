import { useDelete } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useMemoizedFn, useRequest } from 'ahooks';
import { message } from 'antd';
import { useEffect, useRef } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const actionRef = useRef<ActionType>();

  const { subject, grade } = useInitialStateModel();

  // 删除
  const { handleDelete } = useDelete(QuestionApi.deleteQuestionType, {
    onSuccess: () => actionRef.current?.reload?.(),
  });

  // 导入题型数据（纯业务逻辑，不包含弹窗确认）
  const { runAsync: importQuestionTypes, loading: importing } = useRequest(
    async (file: File) => {
      message.loading({ content: '正在导入题型数据...', key: 'import', duration: 0 });

      const result = await QuestionApi.importQuestionTypes(file);

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
    actionRef,
    subject,
    grade,
    handleDelete,
    importing,
    importQuestionTypes,
    validateFile,
  };
};

export const UnitPracticeModel = createContainer(useContainer);
export const useUnitPracticeModel = UnitPracticeModel.useContainer;

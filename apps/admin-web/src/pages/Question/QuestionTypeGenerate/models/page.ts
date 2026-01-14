import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // 状态
  const [count, setCount] = useState<number>(5);
  const [promptEditVisible, setPromptEditVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState('');
  const [generatedQuestionsState, setGeneratedQuestionsState] = useState<Question[]>([]);
  const [optimizeSuggestionVisible, setOptimizeSuggestionVisible] = useState(false);
  const [optimizeSuggestion, setOptimizeSuggestion] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');

  // 加载题型信息
  const {
    data: questionType,
    loading,
    refresh,
  } = useRequest(
    () => {
      if (!code) return Promise.resolve(null);
      return QuestionApi.getQuestionTypeByCode(code);
    },
    {
      refreshDeps: [code],
      ready: !!code,
      onSuccess: (data) => {
        if (data) {
          setEditingPrompt(data.prompt || '');
        }
      },
    },
  );

  // 生成题目
  const { loading: generating, runAsync: generateQuestions } = useRequest(
    async () => {
      if (!code) return [];
      return QuestionApi.generateQuestions(code, count);
    },
    {
      manual: true,
      onSuccess: (data) => {
        message.success(`成功生成 ${data.length} 道题目`);
        setGeneratedQuestionsState(data);
      },
      onError: (error: any) => {
        message.error(error?.message || '生成题目失败');
      },
    },
  );

  const generatedQuestions = generatedQuestionsState;

  // 更新提示词
  const { runAsync: updatePrompt, loading: updatingPrompt } = useRequest(
    async (prompt: string) => {
      if (!code) return;
      return QuestionApi.updateQuestionTypePrompt(code, prompt);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('提示词更新成功');
        setPromptEditVisible(false);
        refresh();
      },
      onError: (error: any) => {
        message.error(error?.message || '更新提示词失败');
      },
    },
  );

  // 优化提示词
  const { runAsync: optimizePrompt, loading: optimizing } = useRequest(
    async (suggestion?: string) => {
      if (!code) return { optimized_prompt: '' };
      return QuestionApi.optimizePrompt(code, suggestion);
    },
    {
      manual: true,
      // 成功和错误消息由 PromptOptimizeModal 统一处理
      onSuccess: (data) => {
        setOptimizedPrompt(data.optimized_prompt);
      },
    },
  );

  // TODO: 批量更新题目功能已废弃（is_active 字段已删除）
  // const { runAsync: batchUpdateQuestions, loading: saving } = useRequest(...)

  // 批量删除题目
  const { runAsync: batchDeleteQuestions, loading: deleting } = useRequest(
    async (ids: string[]) => {
      return QuestionApi.batchDeleteQuestions(ids);
    },
    {
      manual: true,
      onSuccess: (res) => {
        message.success(`成功删除 ${res.deleted_count} 道题目`);
        setGeneratedQuestionsState([]);
      },
      onError: (error: any) => {
        message.error(error?.message || '删除失败');
      },
    },
  );

  // 计算是否有未保存的题目
  const hasUnsavedChanges = (generatedQuestions?.length || 0) > 0;

  // 监听路由变化，弹出确认对话框
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // 处理生成
  const handleGenerate = async () => {
    if (!code) return;
    if (count <= 0) {
      message.warning('生成数量必须大于 0');
      return;
    }
    await generateQuestions();
  };

  // 处理编辑提示词
  const handleEditPrompt = () => {
    setEditingPrompt(questionType?.prompt || '');
    setPromptEditVisible(true);
  };

  // 处理保存提示词（内部使用）
  const handleSavePromptInternal = async () => {
    if (!editingPrompt.trim()) {
      message.warning('提示词不能为空');
      return;
    }
    await updatePrompt(editingPrompt);
  };

  // 处理保存提示词（外部调用，接收提示词参数）
  const handleSavePrompt = async (prompt: string) => {
    if (!prompt.trim()) {
      message.warning('提示词不能为空');
      return;
    }
    await updatePrompt(prompt);
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setPromptEditVisible(false);
    setEditingPrompt(questionType?.prompt || '');
  };

  // 处理优化提示词
  const handleOptimizePrompt = () => {
    setOptimizeSuggestion('');
    setOptimizedPrompt('');
    setOptimizeSuggestionVisible(true);
  };

  // 处理确认优化
  const handleConfirmOptimize = async () => {
    const suggestion = optimizeSuggestion.trim() || undefined;
    await optimizePrompt(suggestion);
  };

  // 处理应用优化后的提示词
  const handleApplyOptimizedPrompt = () => {
    if (!optimizedPrompt.trim()) {
      message.warning('没有可应用的优化结果');
      return;
    }
    setEditingPrompt(optimizedPrompt);
    setPromptEditVisible(true);
    setOptimizeSuggestionVisible(false);
    setOptimizeSuggestion('');
    setOptimizedPrompt('');
  };

  // 处理取消优化
  const handleCancelOptimize = () => {
    setOptimizeSuggestionVisible(false);
    setOptimizeSuggestion('');
    setOptimizedPrompt('');
  };

  // TODO: 处理保存（启用题目）功能已废弃
  const handleSave = async () => {
    message.warning('批量更新题目功能已废弃，原 is_active 字段已删除');
  };

  // 处理删除
  const handleDelete = () => {
    if (!generatedQuestions || generatedQuestions.length === 0) {
      message.warning('没有可删除的题目');
      return;
    }

    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除这 ${generatedQuestions.length} 道生成的题目吗？此操作不可恢复。`,
      okType: 'danger',
      onOk: async () => {
        const ids = generatedQuestions.map((q) => q.id);
        await batchDeleteQuestions(ids);
      },
    });
  };

  // 重置状态
  const reset = () => {
    setGeneratedQuestionsState([]);
    setCount(10);
  };

  return {
    // 状态
    questionType,
    prompt: questionType?.prompt || '',
    generatedQuestions: generatedQuestions || [],
    generating,
    hasUnsavedChanges,
    count,
    promptEditVisible,
    editingPrompt,
    loading,
    saving: false, // TODO: batchUpdateQuestions 已废弃
    deleting,
    updatingPrompt,
    optimizeSuggestionVisible,
    optimizeSuggestion,
    optimizedPrompt,
    optimizing,

    // 方法
    setCount,
    handleGenerate,
    handleEditPrompt,
    handleSavePrompt,
    handleSavePromptInternal,
    handleCancelEdit,
    handleSave,
    handleDelete,
    reset,
    setPromptEditVisible,
    setEditingPrompt,
    handleOptimizePrompt,
    handleConfirmOptimize,
    handleApplyOptimizedPrompt,
    handleCancelOptimize,
    setOptimizeSuggestion,
    navigate,
    // 优化服务函数
    optimizePrompt,
  };
};

export const QuestionTypeGenerateModel = createContainer(useContainer);
export const useQuestionTypeGenerateModel = QuestionTypeGenerateModel.useContainer;

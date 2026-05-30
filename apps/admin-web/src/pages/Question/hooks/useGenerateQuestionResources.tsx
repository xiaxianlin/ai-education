import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { QuestionApi } from '../api';

/**
 * 生成题目素材的 Hook
 * 供列表页和详情页复用
 * 包含 loading 弹窗和交互逻辑
 */
export function useGenerateQuestionResources(onSuccess?: () => void) {
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [generatingResourceId, setGeneratingResourceId] = useState<string | null>(null);

  const { runAsync: generateResources, loading } = useRequest(
    async (questionId: string) => {
      await QuestionApi.generateQuestionResources(questionId);
    },
    {
      manual: true,
      onSuccess: () => {
        setLoadingModalVisible(false);
        setGeneratingResourceId(null);
        toast.success('素材生成成功');
        onSuccess?.();
      },
      onError: (error: any) => {
        setLoadingModalVisible(false);
        setGeneratingResourceId(null);
        toast.error(error?.message || '素材生成失败');
        throw error;
      },
    },
  );

  /**
   * 处理生成素材
   * 显示 loading 弹窗并执行生成操作
   */
  const handleGenerateResources = async (questionId: string) => {
    setGeneratingResourceId(questionId);
    setLoadingModalVisible(true);
    try {
      await generateResources(questionId);
    } catch (error) {
      // 错误已在 onError 中处理
    }
  };

  /**
   * Loading 弹窗组件
   */
  const LoadingModal = () => (
    loadingModalVisible ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-[300px] rounded-lg border bg-white p-6 text-center shadow-lg">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          <div className="mt-4 text-sm text-slate-600">正在生成素材，请稍候...</div>
        </div>
      </div>
    ) : null
  );

  return {
    handleGenerateResources,
    generatingResourceId,
    loading,
    LoadingModal,
  };
}

import { useRequest } from 'ahooks';
import { message, Modal, Spin } from 'antd';
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
        message.success('素材生成成功');
        onSuccess?.();
      },
      onError: (error: any) => {
        setLoadingModalVisible(false);
        setGeneratingResourceId(null);
        message.error(error?.message || '素材生成失败');
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
    <Modal
      open={loadingModalVisible}
      footer={null}
      closable={false}
      maskClosable={false}
      centered
      width={300}
    >
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>正在生成素材，请稍候...</div>
      </div>
    </Modal>
  );

  return {
    handleGenerateResources,
    generatingResourceId,
    loading,
    LoadingModal,
  };
}

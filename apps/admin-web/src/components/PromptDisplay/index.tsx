import { useState } from 'react';
import { useRequest } from 'ahooks';
import { PromptDisplayCard } from './PromptDisplayCard';
import { PromptEditModal } from './PromptEditModal';
import { PromptOptimizeModal } from './PromptOptimizeModal';

interface PromptDisplayProps {
  /** 提示词内容 */
  prompt?: string;
  /** 保存提示词的服务函数 */
  onSave?: (prompt: string) => Promise<void>;
  /** 优化提示词的服务函数 */
  onOptimize?: (suggestion?: string) => Promise<{ optimized_prompt: string }>;
  /** 是否显示优化按钮，默认 true */
  showOptimize?: boolean;
  /** 是否显示编辑按钮，默认 true */
  showEdit?: boolean;
}

export function PromptDisplay({
  prompt,
  onSave,
  onOptimize,
  showOptimize = true,
  showEdit = true,
}: PromptDisplayProps) {
  // 编辑弹窗状态
  const [editVisible, setEditVisible] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState('');

  // 优化弹窗状态
  const [optimizeVisible, setOptimizeVisible] = useState(false);

  // 使用 useRequest 调用优化服务
  const { runAsync: handleOptimizeRequest, loading: optimizing } = useRequest(
    async (suggestion?: string) => {
      if (!onOptimize) {
        throw new Error('优化服务未提供');
      }
      return await onOptimize(suggestion);
    },
    {
      manual: true,
    },
  );

  // 处理编辑
  const handleEdit = () => {
    setEditingPrompt(prompt || '');
    setEditVisible(true);
  };

  // 处理保存
  const handleSave = async (newPrompt: string) => {
    if (onSave) {
      await onSave(newPrompt);
    }
    setEditVisible(false);
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditVisible(false);
    setEditingPrompt(prompt || '');
  };

  // 处理优化
  const handleOptimize = () => {
    setOptimizeVisible(true);
  };

  // 处理取消优化
  const handleCancelOptimize = () => {
    setOptimizeVisible(false);
  };

  // 处理应用优化后的提示词
  const handleApplyOptimizedPrompt = (optimizedPrompt: string) => {
    setEditingPrompt(optimizedPrompt);
    setEditVisible(true);
  };

  return (
    <>
      <PromptDisplayCard
        prompt={prompt}
        showOptimize={showOptimize && !!onOptimize}
        showEdit={showEdit && !!onSave}
        onOptimize={handleOptimize}
        onEdit={handleEdit}
      />

      {/* 编辑弹窗 */}
      {showEdit && onSave && (
        <PromptEditModal
          open={editVisible}
          initialPrompt={editingPrompt}
          onSave={handleSave}
          onCancel={handleCancelEdit}
        />
      )}

      {/* 优化弹窗 */}
      {showOptimize && onOptimize && (
        <PromptOptimizeModal
          open={optimizeVisible}
          onOptimize={handleOptimizeRequest}
          loading={optimizing}
          onCancel={handleCancelOptimize}
          onApply={handleApplyOptimizedPrompt}
        />
      )}
    </>
  );
}

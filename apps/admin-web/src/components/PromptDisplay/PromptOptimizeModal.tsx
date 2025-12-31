import { Button, Input, Modal, Space, message } from 'antd';
import { useState, useEffect } from 'react';

const { TextArea } = Input;

interface PromptOptimizeModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 优化服务函数 */
  onOptimize: (suggestion?: string) => Promise<{ optimized_prompt: string }>;
  /** 加载状态 */
  loading: boolean;
  /** 取消回调 */
  onCancel: () => void;
  /** 应用优化结果回调（将优化后的提示词应用到编辑） */
  onApply?: (optimizedPrompt: string) => void;
}

export function PromptOptimizeModal({
  open,
  onOptimize,
  loading,
  onCancel,
  onApply,
}: PromptOptimizeModalProps) {
  const [optimizeSuggestion, setOptimizeSuggestion] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');

  // 当弹窗关闭时，重置状态
  useEffect(() => {
    if (!open) {
      setOptimizeSuggestion('');
      setOptimizedPrompt('');
    }
  }, [open]);

  // 处理确认优化
  const handleConfirmOptimize = async () => {
    try {
      const suggestion = optimizeSuggestion.trim() || undefined;
      const result = await onOptimize(suggestion);
      setOptimizedPrompt(result.optimized_prompt);
      message.success('提示词优化成功');
    } catch (error: any) {
      message.error(error?.message || '优化提示词失败');
    }
  };

  // 处理应用优化后的提示词
  const handleApplyOptimizedPrompt = () => {
    if (!optimizedPrompt.trim()) {
      message.warning('没有可应用的优化结果');
      return;
    }
    if (onApply) {
      onApply(optimizedPrompt);
    }
    setOptimizeSuggestion('');
    setOptimizedPrompt('');
    onCancel();
  };

  return (
    <Modal
      title="优化提示词"
      open={open}
      onCancel={onCancel}
      width={800}
      destroyOnClose
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        optimizedPrompt ? (
          <Button key="apply" type="primary" onClick={handleApplyOptimizedPrompt}>
            应用到编辑
          </Button>
        ) : (
          <Button key="optimize" type="primary" loading={loading} onClick={handleConfirmOptimize}>
            开始优化
          </Button>
        ),
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <div style={{ marginBottom: 8 }}>优化建议（可选）</div>
          <TextArea
            value={optimizeSuggestion}
            onChange={(e) => setOptimizeSuggestion(e.target.value)}
            rows={4}
            placeholder="请输入优化建议（可选）"
            disabled={!!optimizedPrompt}
          />
          <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
            字符数: {optimizeSuggestion.length}
          </div>
        </div>

        {optimizedPrompt && (
          <div>
            <div style={{ marginBottom: 8 }}>优化后的提示词</div>
            <TextArea
              value={optimizedPrompt}
              rows={15}
              readOnly
              style={{ fontFamily: 'monospace' }}
            />
            <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
              字符数: {optimizedPrompt.length}
            </div>
          </div>
        )}
      </Space>
    </Modal>
  );
}


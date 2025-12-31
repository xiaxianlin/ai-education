import { Input, Modal, message } from 'antd';
import { useState, useEffect } from 'react';

const { TextArea } = Input;

interface PromptEditModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 初始提示词内容 */
  initialPrompt?: string;
  /** 保存回调 */
  onSave: (prompt: string) => Promise<void>;
  /** 取消回调 */
  onCancel: () => void;
}

export function PromptEditModal({ open, initialPrompt = '', onSave, onCancel }: PromptEditModalProps) {
  const [editingPrompt, setEditingPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  // 当弹窗打开或初始提示词变化时，更新编辑内容
  useEffect(() => {
    if (open) {
      setEditingPrompt(initialPrompt);
    }
  }, [open, initialPrompt]);

  // 处理保存
  const handleSave = async () => {
    if (!editingPrompt.trim()) {
      message.warning('提示词不能为空');
      return;
    }

    setSaving(true);
    try {
      await onSave(editingPrompt);
      message.success('提示词保存成功');
    } catch (error: any) {
      message.error(error?.message || '保存提示词失败');
    } finally {
      setSaving(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    setEditingPrompt(initialPrompt);
    onCancel();
  };

  return (
    <Modal
      title="编辑提示词"
      open={open}
      onOk={handleSave}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      confirmLoading={saving}
      width={800}
      destroyOnClose
    >
      <TextArea
        value={editingPrompt}
        onChange={(e) => setEditingPrompt(e.target.value)}
        rows={15}
        placeholder="请输入提示词内容"
        style={{ fontFamily: 'monospace' }}
      />
      <div style={{ marginTop: 8, color: '#999', fontSize: '12px' }}>
        字符数: {editingPrompt.length}
      </div>
    </Modal>
  );
}


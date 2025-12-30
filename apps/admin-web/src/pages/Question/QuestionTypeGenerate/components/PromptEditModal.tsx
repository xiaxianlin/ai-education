import { Modal } from 'antd';
import { Input } from 'antd';
import { useEffect } from 'react';
import { useQuestionTypeGenerateModel } from '../models/page';

const { TextArea } = Input;

export function PromptEditModal() {
  const {
    promptEditVisible,
    editingPrompt,
    updatingPrompt,
    setEditingPrompt,
    handleSavePrompt,
    handleCancelEdit,
  } = useQuestionTypeGenerateModel();

  return (
    <Modal
      title="编辑提示词"
      open={promptEditVisible}
      onOk={handleSavePrompt}
      onCancel={handleCancelEdit}
      okText="保存"
      cancelText="取消"
      confirmLoading={updatingPrompt}
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


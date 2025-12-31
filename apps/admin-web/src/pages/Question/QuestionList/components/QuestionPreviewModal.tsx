import { QuestionCard } from '@/components';
import { Modal } from 'antd';
import React from 'react';

interface QuestionPreviewModalProps {
  question?: Question;
  open: boolean;
  onClose: () => void;
}

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({ question, open, onClose }) => {
  if (!question) return null;

  return (
    <Modal title="题目预览" open={open} onCancel={onClose} footer={null} width={800}>
      <QuestionCard question={question} />
    </Modal>
  );
};

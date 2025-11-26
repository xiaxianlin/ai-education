/**
 * PracticeCard 组件类型定义
 */

export interface PracticeCardProps {
  title: string;
  description?: string;
  createButtonText?: string;
  icon?: React.ReactNode;
  session?: PracticeSession;
  creating?: boolean;
  onCreate?: () => void;
  onStart?: () => void;
}

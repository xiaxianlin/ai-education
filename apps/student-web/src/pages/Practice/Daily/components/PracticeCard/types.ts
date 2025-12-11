import { PracticeStatus } from "@/pages/Practice/constants";

export interface PracticeCardProps {
  textbook: Textbook;
  loading?: boolean;
  practice?: PracticeSession;
  status?: PracticeStatus;
  onCreate?: () => void;
}

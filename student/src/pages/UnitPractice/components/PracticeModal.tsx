/**
 * 开始练习弹窗组件
 */
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PracticeModalProps {
  open: boolean;
  unitName: string;
  creating: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const PracticeModal = memo(function PracticeModal({
  open,
  unitName,
  creating,
  onClose,
  onSubmit,
}: PracticeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                开始练习
              </h2>
              <p className="text-base text-gray-600">{unitName}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-800 rounded-full w-10 h-10"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <div className="px-6 py-8 space-y-4">
          <div className="text-center space-y-3">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-lg text-gray-700">
              将为 <span className="font-bold text-blue-600">{unitName}</span>{" "}
              生成练习题目
            </p>
            <p className="text-sm text-gray-500">
              AI 会根据你的学习情况自动调整题目难度
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-14 text-lg rounded-2xl"
          >
            取消
          </Button>
          <Button
            onClick={onSubmit}
            disabled={creating}
            className="flex-1 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            {creating ? "准备中..." : "开始 🚀"}
          </Button>
        </div>
      </div>
    </div>
  );
});

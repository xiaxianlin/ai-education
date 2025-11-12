/**
 * 知识点弹窗组件
 */
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';
import type { Knowledge } from '@/services/profile';

interface KnowledgeModalProps {
  open: boolean;
  unitName: string;
  knowledges: Knowledge[];
  onClose: () => void;
}

export const KnowledgeModal = memo(function KnowledgeModal({
  open,
  unitName,
  knowledges,
  onClose,
}: KnowledgeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
          <div>
            <h2 className="text-xl font-bold text-gray-800">知识点</h2>
            <p className="text-sm text-gray-500 mt-1">{unitName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-3 bg-gradient-to-b from-white via-white to-purple-50/40">
          {knowledges.length > 0 ? (
            knowledges.map((knowledge) => (
              <div
                key={knowledge.id}
                className="flex items-start gap-3 rounded-2xl border border-purple-100/70 bg-white/90 p-4 shadow-sm"
              >
                <div className="p-2 rounded-xl bg-purple-50/70 text-purple-500">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{knowledge.name}</p>
                  {knowledge.content && (
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{knowledge.content}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">该单元暂未配置知识点。</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end">
          <Button onClick={onClose}>知道了</Button>
        </div>
      </div>
    </div>
  );
});


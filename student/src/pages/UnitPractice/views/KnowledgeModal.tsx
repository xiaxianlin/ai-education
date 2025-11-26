/**
 * 知识点弹窗组件
 */
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';

interface KnowledgeModalProps {
  open: boolean;
  unitName: string;
  knowledges: Knowledge[];
  loading?: boolean;
  onClose: () => void;
}

export const KnowledgeModal = memo(function KnowledgeModal({
  open,
  unitName,
  knowledges,
  loading = false,
  onClose,
}: KnowledgeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-background rounded-3xl shadow-2xl overflow-hidden border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-foreground">知识点</h2>
            <p className="text-sm text-muted-foreground mt-1">{unitName}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto space-y-3 bg-background">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">加载中...</div>
            </div>
          ) : knowledges.length > 0 ? (
            knowledges.map((knowledge) => (
              <div
                key={knowledge.id}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{knowledge.name}</p>
                  {knowledge.content && (
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{knowledge.content}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">该单元暂未配置知识点。</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-border bg-background flex justify-end">
          <Button onClick={onClose}>知道了</Button>
        </div>
      </div>
    </div>
  );
});


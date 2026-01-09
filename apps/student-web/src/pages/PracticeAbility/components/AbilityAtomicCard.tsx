/**
 * 原子能力卡片组件
 * 显示原子能力信息，点击可创建对应的能力练习
 */
import { Button } from "@/components/ui";
import { Sparkles, Loader2 } from "lucide-react";
import { usePageModel } from "../models/page";
import { useProfileModel } from "@/common/models/ProfileModel";

interface AbilityAtomicCardProps {
  atomic: AbilityAtomic;
}

export function AbilityAtomicCard({ atomic }: AbilityAtomicCardProps) {
  const { creating, createPractice } = usePageModel();
  const { profile, activeTextbooks } = useProfileModel();
  const { grade, subject } = profile || {};

  // 找到匹配的教材（用于创建练习）
  const matchedTextbook = activeTextbooks.find(
    (t) => t.subject === atomic.subject && t.grade === atomic.grade
  );

  const handleCreatePractice = () => {
    if (!matchedTextbook || !grade || !atomic.subject) return;
    
    createPractice({
      abilityCodes: [atomic.code],
      subject: atomic.subject,
      grade: grade,
      textbookId: matchedTextbook.id,
    });
  };

  // 难度显示
  const difficultyStars = "⭐".repeat(atomic.difficulty || 1);

  return (
    <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all">
      <div className="p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">{atomic.name}</h3>
            {atomic.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{atomic.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">难度</span>
            <span className="text-sm">{difficultyStars}</span>
          </div>
          <div className="px-2 py-1 bg-primary/10 rounded-lg text-[10px] font-medium text-primary">
            {atomic.domain_code}
          </div>
        </div>

        <Button
          disabled={creating || !matchedTextbook}
          onClick={handleCreatePractice}
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold text-sm transition-all"
        >
          {creating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              创建中...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              开始练习
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

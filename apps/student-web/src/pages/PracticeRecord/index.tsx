/**
 * 练习记录列表页面
 * 显示所有类型的练习历史记录，支持下滑自动加载
 */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { studentApi } from "@/lib/api";
import { getPracticeIcon, getPracticeName } from "@/lib/practice";
import { useRequest } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { HistoryCard } from "./components/HistoryCard";
import { RecordEmpty } from "./components/RecordEmpty";
import { RecordSkeleton } from "./components/RecordSkeleton";

// 固定的练习类型列表（根据后端支持的练习类型）
// practice_id 映射：1=ability_practice, 2=unit_practice
const PRACTICE_TYPES = [
  { id: 1, type: "ability_practice" },
  { id: 2, type: "unit_practice" },
] as const;

export default function PracticeRecord() {
  const [activeTab, setActiveTab] = useState<number>(PRACTICE_TYPES[0].id);
  const [page, setPage] = useState(1);
  const [allRecords, setAllRecords] = useState<Practice[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const activePractice = PRACTICE_TYPES.find((p) => p.id === activeTab);

  // 获取练习记录
  const { loading } = useRequest(
    () => studentApi.getPracticeRecords(activeTab, page, 20),
    {
      ready: !!activeTab,
      refreshDeps: [activeTab, page],
      onSuccess: (res) => {
        if (page === 1) {
          setAllRecords(res.data || []);
        } else {
          setAllRecords((prev) => [...prev, ...(res.data || [])]);
        }
        const newTotal = page === 1 ? (res.data?.length || 0) : allRecords.length + (res.data?.length || 0);
        setHasMore(newTotal < res.total && (res.data?.length || 0) >= res.pageSize);
      },
    }
  );

  // 切换标签页时重置
  useEffect(() => {
    setPage(1);
    setAllRecords([]);
    setHasMore(true);
  }, [activeTab]);

  // 无限滚动监听
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  const renderHistoryList = () => {
    if (loading && allRecords.length === 0) {
      return <RecordSkeleton />;
    }

    if (!loading && allRecords.length === 0) {
      return <RecordEmpty title={activePractice ? getPracticeName(activePractice.type) : undefined} />;
    }

    return (
      <>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-springy">
          {allRecords.map((session, idx) => (
            <div key={session.id} className="animate-springy" style={{ animationDelay: `${idx * 100}ms` }}>
              <HistoryCard session={session} />
            </div>
          ))}
        </div>
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center py-8">
            {loading && <div className="text-muted-foreground">加载中...</div>}
          </div>
        )}
        {!hasMore && allRecords.length > 0 && (
          <div className="flex justify-center py-8">
            <div className="text-sm text-muted-foreground">没有更多记录了</div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-springy">
      {/* 顶部介绍卡片 */}
      <section className="bg-white rounded-[2rem] p-8 border-4 border-white shadow-xl shadow-primary/5 flex items-center gap-6">
        <div className="text-6xl animate-float">📊</div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-foreground">我的练习记录</h1>
          <p className="text-lg font-bold text-muted-foreground italic">查看你的成长历程，每一次练习都是进步！🚀</p>
        </div>
      </section>

      {/* 按类型分类的标签页 */}
      <Tabs value={String(activeTab)} onValueChange={(key) => setActiveTab(Number(key))} className="w-full">
        <TabsList className="bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border-2 border-primary/10 mb-10 h-auto grid grid-cols-2 gap-2">
          {PRACTICE_TYPES.map((p) => (
            <TabsTrigger
              key={p.id}
              value={String(p.id)}
              className="rounded-2xl py-4 text-lg font-black transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-primary/20 data-[state=active]:scale-105"
            >
              <span className="mr-2 text-xl">{getPracticeIcon(p.type)}</span>
              {getPracticeName(p.type)}
            </TabsTrigger>
          ))}
        </TabsList>

        {PRACTICE_TYPES.map((p) => (
          <TabsContent key={p.id} value={String(p.id)} className="mt-0 focus-visible:outline-none">
            {renderHistoryList()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

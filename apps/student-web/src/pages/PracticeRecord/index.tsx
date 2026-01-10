/**
 * 练习记录列表页面
 * 显示当前年级和学科的练习历史记录，支持下滑自动加载
 */
import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { HistoryCard } from "./components/HistoryCard";
import { RecordEmpty } from "./components/RecordEmpty";
import { RecordSkeleton } from "./components/RecordSkeleton";

export default function PracticeRecord() {
  const [page, setPage] = useState(1);
  const [allRecords, setAllRecords] = useState<Practice[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // 获取练习记录
  const { loading } = useRequest(() => studentApi.getPracticeRecords(page, 20), {
    refreshDeps: [page],
    onSuccess: (res) => {
      if (page === 1) {
        setAllRecords(res.data || []);
      } else {
        setAllRecords((prev) => [...prev, ...(res.data || [])]);
      }
      const newTotal = page === 1 ? res.data?.length || 0 : allRecords.length + (res.data?.length || 0);
      setHasMore(newTotal < res.total && (res.data?.length || 0) >= res.pageSize);
    },
  });

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
      return <RecordEmpty />;
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

      {/* 练习记录列表 */}
      <section>{renderHistoryList()}</section>
    </div>
  );
}

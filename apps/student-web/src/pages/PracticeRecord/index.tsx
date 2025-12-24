/**
 * 练习记录列表页面
 * 显示所有类型的练习历史记录
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useState } from "react";
import { HistoryCard } from "./components/HistoryCard";
import { RecordEmpty } from "./components/RecordEmpty";
import { RecordSkeleton } from "./components/RecordSkeleton";

export default function PracticeRecord() {
  const { practices } = useProfileModel();
  const [activeTab, setActiveTab] = useState(practices[0].id);

  const practice = practices.find((p) => p.id === activeTab);
  // 获取各类型的历史记录
  const { data = [], loading } = useRequest(() => studentApi.getPracticeRecords(Number(activeTab)), {
    ready: !!activeTab,
    refreshDeps: [activeTab],
  });

  const renderHistoryList = () => {
    if (loading) {
      return <RecordSkeleton />;
    }

    if (!data || data.length === 0) {
      return <RecordEmpty title={practice?.name} />;
    }

    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-springy">
        {data.map((session, idx) => (
          <div key={session.id} className="animate-springy" style={{ animationDelay: `${idx * 100}ms` }}>
            <HistoryCard session={session} practice={practice} />
          </div>
        ))}
      </div>
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
        <TabsList className="bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border-2 border-primary/10 mb-10 h-auto grid grid-cols-3 gap-2">
          {practices.map((p) => (
            <TabsTrigger
              key={p.id}
              value={String(p.id)}
              className="rounded-2xl py-4 text-lg font-black transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-primary/20 data-[state=active]:scale-105"
            >
              <span className="mr-2 text-xl">{p.icon}</span>
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {practices.map((p) => (
          <TabsContent key={p.id} value={String(p.id)} className="mt-0 focus-visible:outline-none">
            {renderHistoryList()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

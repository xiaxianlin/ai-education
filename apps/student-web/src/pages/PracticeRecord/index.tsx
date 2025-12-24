/**
 * 练习记录列表页面
 * 显示所有类型的练习历史记录
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { Card, CardContent, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((session) => (
          <HistoryCard key={session.id} session={session} practice={practice} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 顶部介绍卡片 */}
      <Card className="border-2 border-primary/20 shadow-lg rounded-3xl bg-card overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="text-4xl">📚</div>练习记录
            </h1>
            <p className="text-sm text-muted-foreground mt-1">查看你的所有练习历史记录，回顾学习历程。</p>
          </div>
        </CardContent>
      </Card>

      {/* 按类型分类的标签页 */}
      <Tabs value={String(activeTab)} onValueChange={(key) => setActiveTab(Number(key))} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto rounded-full bg-muted/80 px-3.5 py-2 gap-2 border border-border my-3">
          {practices.map((practice) => (
            <TabsTrigger
              key={practice.id}
              value={String(practice.id)}
              className="rounded-full px-6 py-2.5 text-base font-medium text-muted-foreground transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-105 hover:text-primary"
            >
              {practice.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {practices.map((practice) => (
          <TabsContent key={practice.id} value={String(practice.id)} className="mt-4">
            {renderHistoryList()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

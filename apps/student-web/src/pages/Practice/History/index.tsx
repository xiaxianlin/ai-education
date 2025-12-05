/**
 * 练习记录列表页面
 * 显示所有类型的练习历史记录
 */
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useRequest } from "ahooks";
import { studentApi } from "@/lib/api";
import { HistoryCard } from "./components/HistoryCard";
import { Skeleton } from "@/components/ui/skeleton";

const PRACTICE_TYPES: Array<{
  value: PracticeSessionType;
  label: string;
}> = [
  { value: "daily_practice", label: "每日练习" },
  { value: "unit_practice", label: "单元练习" },
  { value: "assessment", label: "能力评测" },
];

export default function PracticeHistory() {
  const [activeTab, setActiveTab] =
    useState<PracticeSessionType>("daily_practice");

  // 获取各类型的历史记录
  const { data: dailyHistory = [], loading: dailyLoading } = useRequest(() =>
    studentApi.getPracticeHistory("daily_practice")
  );

  const { data: unitHistory = [], loading: unitLoading } = useRequest(() =>
    studentApi.getPracticeHistory("unit_practice")
  );

  const { data: assessmentHistory = [], loading: assessmentLoading } =
    useRequest(() => studentApi.getPracticeHistory("assessment"));

  const getHistoryByType = (type: PracticeSessionType) => {
    switch (type) {
      case "daily_practice":
        return dailyHistory;
      case "unit_practice":
        return unitHistory;
      case "assessment":
        return assessmentHistory;
    }
  };

  const getLoadingByType = (type: PracticeSessionType) => {
    switch (type) {
      case "daily_practice":
        return dailyLoading;
      case "unit_practice":
        return unitLoading;
      case "assessment":
        return assessmentLoading;
    }
  };

  const renderHistoryList = (type: PracticeSessionType) => {
    const history = getHistoryByType(type);
    const loading = getLoadingByType(type);

    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-2 border-border">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (history.length === 0) {
      return (
        <Card className="border-2 border-accent/50 bg-accent/10">
          <CardContent className="py-10 px-6 text-center space-y-3">
            <div className="text-5xl">📝</div>
            <p className="text-xl font-bold text-foreground">暂无记录</p>
            <p className="text-sm text-muted-foreground">
              还没有{PRACTICE_TYPES.find((t) => t.value === type)?.label}记录
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((session) => (
          <HistoryCard key={session.id} session={session} />
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
            <p className="text-sm text-muted-foreground mt-1">
              查看你的所有练习历史记录，回顾学习历程。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 按类型分类的标签页 */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as PracticeSessionType)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 h-auto rounded-full bg-muted/80 px-3.5 py-2 gap-2 border border-border my-3">
          {PRACTICE_TYPES.map((type) => (
            <TabsTrigger
              key={type.value}
              value={type.value}
              className="rounded-full px-6 py-2.5 text-base font-medium text-muted-foreground transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-105 hover:text-primary"
            >
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PRACTICE_TYPES.map((type) => (
          <TabsContent key={type.value} value={type.value} className="mt-4">
            {renderHistoryList(type.value)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

/**
 * 首页
 * 视图层：只负责渲染，业务逻辑在 hooks 中
 */
import { StatisticsSection } from "./components/StatisticsSection";
import { useHomeStatistics } from "./hooks/useHomeStatistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const { statistics, loading } = useHomeStatistics();

  return (
    <div className="space-y-8 animate-springy">
      {/* 标题区域 */}
      <section className="space-y-4">
        <div className="flex items-center gap-4 px-2">
          <div className="w-2 h-10 bg-primary rounded-full" />
          <h1 className="text-3xl font-black text-foreground">我的学习统计</h1>
        </div>
        <p className="text-lg font-bold text-muted-foreground px-2">
          查看你的练习数据，了解学习进度和成果
        </p>
      </section>

      {/* 统计数据区域 */}
      <section className="space-y-6">
        {statistics ? (
          <Tabs defaultValue="recent_30_days" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="recent_30_days">最近30天</TabsTrigger>
              <TabsTrigger value="all_time">全部时间</TabsTrigger>
            </TabsList>
            <TabsContent value="recent_30_days" className="mt-6">
              <StatisticsSection statistics={statistics.recent_30_days} loading={loading} />
            </TabsContent>
            <TabsContent value="all_time" className="mt-6">
              <StatisticsSection statistics={statistics.all_time} loading={loading} />
            </TabsContent>
          </Tabs>
        ) : (
          <StatisticsSection
            statistics={{
              total_practices: 0,
              total_questions: 0,
              completed_unit_practices: 0,
              completed_ability_practices: 0,
              total_accuracy: 0,
              average_accuracy: 0,
            }}
            loading={loading}
          />
        )}
      </section>
    </div>
  );
}

/**
 * 教材单元区域组件
 * 显示某个教材下的所有单元练习卡片
 */
import { GRADES } from "@/constants/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileStore } from "@/stores/profile-store";
import { TextbookUnits } from "../components/TextbookUnits";

export function TextbookTabs() {
  const activeTextbooks = useProfileStore(
    (state) => state.activeTextbooks || []
  );

  return (
    <Tabs defaultValue={activeTextbooks[0].id.toString()}>
      <TabsList className="h-auto rounded-full bg-muted/80 p-1.5 gap-2 border border-border my-3">
        {activeTextbooks.map((textbook) => (
          <TabsTrigger
            key={textbook.id}
            value={textbook.id.toString()}
            className="rounded-full px-6 py-2.5 text-base font-medium text-muted-foreground transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-105 hover:text-primary"
          >
            {textbook.subject} · {GRADES[textbook.grade]}
            {textbook.semester}
          </TabsTrigger>
        ))}
      </TabsList>
      {activeTextbooks.map((textbook) => (
        <TabsContent key={textbook.id} value={textbook.id.toString()}>
          <TextbookUnits textbook={textbook} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

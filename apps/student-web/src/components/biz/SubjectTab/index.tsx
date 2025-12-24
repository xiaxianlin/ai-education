import { useProfileModel } from "@/common/models/ProfileModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";

interface SubjectTabsProps {
  className?: string;
  children: (subject: string) => React.ReactNode;
}

export function SubjectTabs({ className, children }: SubjectTabsProps) {
  const { subjects } = useProfileModel();
  return (
    <Tabs defaultValue={subjects[0]} className={className}>
      <TabsList className="h-auto rounded-full bg-muted/80 p-1.5 gap-2 border border-border my-3">
        {subjects.map((subject) => (
          <TabsTrigger
            key={subject}
            value={subject}
            className="rounded-full px-6 py-2.5 text-base font-medium text-muted-foreground transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:scale-105 hover:text-primary"
          >
            {subject}
          </TabsTrigger>
        ))}
      </TabsList>
      {subjects.map((subject) => (
        <TabsContent key={subject} value={subject}>
          {children(subject)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

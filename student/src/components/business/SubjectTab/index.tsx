import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProfileStore } from "@/stores/profile-store";

interface SubjectTabsProps {
  children: (subject: string) => React.ReactNode;
}

export function SubjectTabs({ children }: SubjectTabsProps) {
  const subjects = useProfileStore((state) => state.subjects || []);
  return (
    <Tabs defaultValue={subjects[0]}>
      <TabsList>
        {subjects.map((subject) => (
          <TabsTrigger key={subject} value={subject}>
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

import { useProfileStore } from "@/stores/profile-store";
import { SubjectTabs } from "@/components/business/SubjectTab";
import { useRequest } from "ahooks";
import { practiceService } from "@/services/practice";
import { PracticeCard } from "./views/PracticeCard";

export default function DailyPractice() {
  const activeTextbooks = useProfileStore(
    (state) => state.activeTextbooks || []
  );

  const { data: practices = [] } = useRequest(
    practiceService.getDailyPractice,
    { ready: !!activeTextbooks.length }
  );

  return (
    <SubjectTabs>
      {(subject) => {
        const textbooks = activeTextbooks.filter((t) => t.subject === subject);
        return (
          <div key={subject}>
            {textbooks.map((t) => {
              const practice = practices.find((p) => p.textbook_id === t.id);
              return (
                <PracticeCard key={t.id} textbook={t} practice={practice} />
              );
            })}
          </div>
        );
      }}
    </SubjectTabs>
  );
}

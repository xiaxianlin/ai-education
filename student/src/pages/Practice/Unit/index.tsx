import { useProfileStore } from "@/stores/profile-store";
import { KnowledgeModal } from "./views/KnowledgeModal";
import { Header } from "./views/Header";
import { Empty } from "./views/Empty";
import { ConfirmModal } from "./views/ConfirmModal";
import { useUnitPracticeStore } from "./stores/unit-practice-store";
import { useEffect } from "react";
import { TextbookTabs } from "./views/TextbookTabs";

export default function UnitPractice() {
  const activeTextbooks = useProfileStore(
    (state) => state.activeTextbooks || []
  );

  const { queryPractices } = useUnitPracticeStore();

  useEffect(() => {
    queryPractices();
  }, []);

  return (
    <div>
      <Header />
      {activeTextbooks.length ? <TextbookTabs /> : <Empty />}
      <KnowledgeModal />
      <ConfirmModal />
    </div>
  );
}

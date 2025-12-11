import { PageModel } from "@/pages/Practice/Daily/models/PageModel";
import { MainView } from "./views/Main";

export default function DailyPractice() {
  return (
    <PageModel.Provider>
      <MainView />
    </PageModel.Provider>
  );
}

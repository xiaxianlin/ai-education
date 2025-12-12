import { PageModel } from "@/pages/Practice/Unit/models/PageModel";
import { MainView } from "./views/Main";

export default function UnitPractice() {
  return (
    <PageModel.Provider>
      <MainView />
    </PageModel.Provider>
  );
}

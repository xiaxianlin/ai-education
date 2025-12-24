import { PageModel } from "./models/PageModel";
import { MainView } from "./views/Main";

export default function UnitPractice() {
  return (
    <PageModel.Provider>
      <MainView />
    </PageModel.Provider>
  );
}

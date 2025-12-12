import { PageModel } from "./models/PageModel";
import { MainView } from "./views/Main";

export default function PracticeSession() {
  return (
    <PageModel.Provider>
      <MainView />
    </PageModel.Provider>
  );
}

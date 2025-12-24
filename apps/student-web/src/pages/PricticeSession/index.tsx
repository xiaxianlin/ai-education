import { PageModel } from "./models/page";
import { MainView } from "./views/Main";

export default function PracticeSession() {
  return (
    <PageModel.Provider>
      <MainView />
    </PageModel.Provider>
  );
}

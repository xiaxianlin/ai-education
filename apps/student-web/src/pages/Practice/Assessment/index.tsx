import { PageModel } from "./models/PageModel";
import { MainView } from "./views/Main";

export default function AssessmentPractice() {
  return (
    <PageModel.Provider>
      <MainView />
    </PageModel.Provider>
  );
}

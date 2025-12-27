import { PracticeSessionModel } from "./models/page";
import { MainView } from "./views/Main";

export default function PracticeSession() {
  return (
    <PracticeSessionModel.Provider>
      <MainView />
    </PracticeSessionModel.Provider>
  );
}

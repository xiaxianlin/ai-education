import { PracticePromptModel } from './models/page';
import MainView from './views/Main';

export default function PracticePromptPage() {
  return (
    <PracticePromptModel.Provider>
      <MainView />
    </PracticePromptModel.Provider>
  );
}


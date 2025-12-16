import { PromptTestModel } from './models/page';
import MainView from './views/Main';

export default function PromptTestPage() {
  return (
    <PromptTestModel.Provider>
      <MainView />
    </PromptTestModel.Provider>
  );
}


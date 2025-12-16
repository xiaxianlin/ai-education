import { PromptFormModel } from './models/page';
import MainView from './views/Main';

export default function PromptFormPage() {
  return (
    <PromptFormModel.Provider>
      <MainView />
    </PromptFormModel.Provider>
  );
}

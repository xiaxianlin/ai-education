import { PromptTestRecordsModel } from './models/page';
import MainView from './views/Main';

export default function PromptTestRecordsPage() {
  return (
    <PromptTestRecordsModel.Provider>
      <MainView />
    </PromptTestRecordsModel.Provider>
  );
}


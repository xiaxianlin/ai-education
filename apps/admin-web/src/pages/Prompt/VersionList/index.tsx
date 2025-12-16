import { PromptVersionListModel } from './models/page';
import MainView from './views/Main';

export default function PromptVersionListPage() {
  return (
    <PromptVersionListModel.Provider>
      <MainView />
    </PromptVersionListModel.Provider>
  );
}


import { PromptListModel } from './models/page';
import MainView from './views/Main';

export default function PromptListPage() {
  return (
    <PromptListModel.Provider>
      <MainView />
    </PromptListModel.Provider>
  );
}

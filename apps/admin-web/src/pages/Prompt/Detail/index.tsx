import { PromptDetailModel } from './models/page';
import MainView from './views/Main';

export default function PromptDetailPage() {
  return (
    <PromptDetailModel.Provider>
      <MainView />
    </PromptDetailModel.Provider>
  );
}

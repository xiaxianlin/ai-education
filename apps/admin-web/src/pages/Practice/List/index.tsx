import { PracticeListModel } from './models/page';
import MainView from './views/Main';

export default function PracticeListPage() {
  return (
    <PracticeListModel.Provider>
      <MainView />
    </PracticeListModel.Provider>
  );
}


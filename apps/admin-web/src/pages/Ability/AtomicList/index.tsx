import { AtomicListModel } from './models/page';
import MainView from './views/Main';

export default function AtomicListPage() {
  return (
    <AtomicListModel.Provider>
      <MainView />
    </AtomicListModel.Provider>
  );
}

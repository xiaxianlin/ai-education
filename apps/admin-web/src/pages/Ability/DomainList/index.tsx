import { DomainListModel } from './models/page';
import MainView from './views/Main';

export default function DomainListPage() {
  return (
    <DomainListModel.Provider>
      <MainView />
    </DomainListModel.Provider>
  );
}

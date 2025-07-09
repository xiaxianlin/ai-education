import { MainView } from './views/Main';
import { AccountListModel } from './models/page';

export default function ManagerListPage() {
  return (
    <AccountListModel.Provider>
      <MainView />
    </AccountListModel.Provider>
  );
}

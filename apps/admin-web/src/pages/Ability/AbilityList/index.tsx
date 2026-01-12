import { AbilityListModel } from './models/page';
import MainView from './views/Main';

export default function AbilityListPage() {
  return (
    <AbilityListModel.Provider>
      <MainView />
    </AbilityListModel.Provider>
  );
}

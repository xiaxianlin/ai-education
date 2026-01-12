import { AbilityDetailModel } from './models/page';
import MainView from './views/Main';

export default function AbilityDetailPage() {
  return (
    <AbilityDetailModel.Provider>
      <MainView />
    </AbilityDetailModel.Provider>
  );
}

import { AbilityModel } from './models/page';
import MainView from './views/Main';

export default function AbilityPage() {
  return (
    <AbilityModel.Provider>
      <MainView />
    </AbilityModel.Provider>
  );
}

import { HomeModel } from './models/page';
import MainView from './views/Main';

export default function HomePage() {
  return (
    <HomeModel.Provider>
      <MainView />
    </HomeModel.Provider>
  );
}

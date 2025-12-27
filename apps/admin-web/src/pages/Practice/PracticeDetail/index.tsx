import { PracticeDetailModel } from './models/page';
import MainView from './views/Main';

export default function PracticeDetailPage() {
  return (
    <PracticeDetailModel.Provider>
      <MainView />
    </PracticeDetailModel.Provider>
  );
}

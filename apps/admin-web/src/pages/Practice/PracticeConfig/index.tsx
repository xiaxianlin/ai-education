import { PracticeConfigModel } from './models/page';
import MainView from './views/Main';

export default function PracticeConfigPage() {
  return (
    <PracticeConfigModel.Provider>
      <MainView />
    </PracticeConfigModel.Provider>
  );
}


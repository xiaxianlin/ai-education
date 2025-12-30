import './index.less';
import { PracticeFormModel } from './models/page';
import MainView from './views/Main';

export default function PracticeFormPage() {
  return (
    <PracticeFormModel.Provider>
      <MainView />
    </PracticeFormModel.Provider>
  );
}

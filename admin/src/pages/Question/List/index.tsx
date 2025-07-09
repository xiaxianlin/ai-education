import { QuestionListModel } from './models/page';
import MainView from './views/Main';

export default function DeviceListPage() {
  return (
    <QuestionListModel.Provider>
      <MainView />
    </QuestionListModel.Provider>
  );
}

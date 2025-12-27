import { QuestionListModel } from './models/page';
import MainView from './views/Main';

export default function QuestionListPage() {
  return (
    <QuestionListModel.Provider>
      <MainView />
    </QuestionListModel.Provider>
  );
}

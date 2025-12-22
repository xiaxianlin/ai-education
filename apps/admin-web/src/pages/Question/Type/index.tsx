import { QuestionTypeListModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTypeListPage() {
  return (
    <QuestionTypeListModel.Provider>
      <MainView />
    </QuestionTypeListModel.Provider>
  );
}


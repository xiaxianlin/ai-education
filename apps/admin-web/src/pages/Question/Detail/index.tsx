import { QuestionDetailModel } from './models/page';
import MainView from './views/Main';

export default function QuestionDetailPage() {
  return (
    <QuestionDetailModel.Provider>
      <MainView />
    </QuestionDetailModel.Provider>
  );
}

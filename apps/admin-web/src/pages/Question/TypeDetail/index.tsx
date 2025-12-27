import { QuestionTypeDetailModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTypeDetailPage() {
  return (
    <QuestionTypeDetailModel.Provider>
      <MainView />
    </QuestionTypeDetailModel.Provider>
  );
}

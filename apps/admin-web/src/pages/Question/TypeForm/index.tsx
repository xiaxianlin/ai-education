import { QuestionTypeFormModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTypeFormPage() {
  return (
    <QuestionTypeFormModel.Provider>
      <MainView />
    </QuestionTypeFormModel.Provider>
  );
}

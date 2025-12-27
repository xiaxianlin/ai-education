import { QuestionFormModel } from './models/page';
import MainView from './views/Main';

export default function QuestionFormPage() {
  return (
    <QuestionFormModel.Provider>
      <MainView />
    </QuestionFormModel.Provider>
  );
}

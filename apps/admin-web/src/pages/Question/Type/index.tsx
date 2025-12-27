import { QuestionTypeModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTypePage() {
  return (
    <QuestionTypeModel.Provider>
      <MainView />
    </QuestionTypeModel.Provider>
  );
}

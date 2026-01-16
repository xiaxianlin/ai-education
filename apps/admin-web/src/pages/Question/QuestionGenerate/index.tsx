import { QuestionGenerateModel } from './models/page';
import MainView from './views/Main';

export default function QuestionGeneratePage() {
  return (
    <QuestionGenerateModel.Provider>
      <MainView />
    </QuestionGenerateModel.Provider>
  );
}

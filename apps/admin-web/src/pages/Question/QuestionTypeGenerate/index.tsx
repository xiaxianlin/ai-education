import { QuestionTypeGenerateModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTypeGenerate() {

  return (
    <QuestionTypeGenerateModel.Provider>
      <MainView />
    </QuestionTypeGenerateModel.Provider>
  );
}


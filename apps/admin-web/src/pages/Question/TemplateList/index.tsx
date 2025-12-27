import { QuestionTemplateModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTemplatePage() {
  return (
    <QuestionTemplateModel.Provider>
      <MainView />
    </QuestionTemplateModel.Provider>
  );
}

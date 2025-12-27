import { QuestionTemplateFormModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTemplateFormPage() {
  return (
    <QuestionTemplateFormModel.Provider>
      <MainView />
    </QuestionTemplateFormModel.Provider>
  );
}

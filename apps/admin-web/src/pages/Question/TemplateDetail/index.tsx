import { QuestionTemplateDetailModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTemplateDetailPage() {
  return (
    <QuestionTemplateDetailModel.Provider>
      <MainView />
    </QuestionTemplateDetailModel.Provider>
  );
}

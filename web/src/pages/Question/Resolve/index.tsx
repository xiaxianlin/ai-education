import { QuestionResolveModel } from './models/page';
import MainView from './views/Main';

export default function QuestionPage() {
  return (
    <QuestionResolveModel.Provider>
      <MainView />
    </QuestionResolveModel.Provider>
  );
}

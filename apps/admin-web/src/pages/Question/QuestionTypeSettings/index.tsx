import { QuestionTypeSettingsModel } from './models/page';
import MainView from './views/Main';

export default function QuestionTypeSettingsPage() {
  return (
    <QuestionTypeSettingsModel.Provider>
      <MainView />
    </QuestionTypeSettingsModel.Provider>
  );
}

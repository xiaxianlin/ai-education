import { TextbookConfigModel } from './models/page';
import MainView from './views/Main';

export default function StudentTextbookConfigPage() {
  return (
    <TextbookConfigModel.Provider>
      <MainView />
    </TextbookConfigModel.Provider>
  );
}

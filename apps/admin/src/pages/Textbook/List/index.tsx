import { TextbookListModel } from './models/page';
import MainView from './views/Main';

export default function TextbookListPage() {
  return (
    <TextbookListModel.Provider>
      <MainView />
    </TextbookListModel.Provider>
  );
}

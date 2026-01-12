import { TextbookVersionListModel } from './models/page';
import MainView from './views/Main';

export default function TextbookVersionListPage() {
  return (
    <TextbookVersionListModel.Provider>
      <MainView />
    </TextbookVersionListModel.Provider>
  );
}

import { TextbookDetailModel } from './models/page';
import MainView from './views/Main';

export default function TextbookDetailPage() {
  return (
    <TextbookDetailModel.Provider>
      <MainView />
    </TextbookDetailModel.Provider>
  );
}

import { TextbookDetailModel } from './models/page';
import MainView from './views/Main';
import './index.less';

export default function TextbookDetailPage() {
  return (
    <TextbookDetailModel.Provider>
      <MainView />
    </TextbookDetailModel.Provider>
  );
}

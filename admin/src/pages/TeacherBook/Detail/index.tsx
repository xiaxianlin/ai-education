import { TeacherBookDetailModel } from './models/page';
import MainView from './views/Main';
import './index.less';

export default function TeacherBookDetailPage() {
  return (
    <TeacherBookDetailModel.Provider>
      <MainView />
    </TeacherBookDetailModel.Provider>
  );
}

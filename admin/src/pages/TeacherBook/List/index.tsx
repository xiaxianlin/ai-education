import { TeacherBookListModel } from './models/page';
import MainView from './views/Main';

export default function TeacherBookListPage() {
  return (
    <TeacherBookListModel.Provider>
      <MainView />
    </TeacherBookListModel.Provider>
  );
}

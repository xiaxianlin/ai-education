import { StudentListModel } from './models/page';
import MainView from './views/Main';

export default function StudentListPage() {
  return (
    <StudentListModel.Provider>
      <MainView />
    </StudentListModel.Provider>
  );
}


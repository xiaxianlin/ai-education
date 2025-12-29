import './index.less';
import { StudentDetailModel } from './models/page';
import { Main } from './views/Main';

export default function StudentDetailPage() {
  return (
    <StudentDetailModel.Provider>
      <Main />
    </StudentDetailModel.Provider>
  );
}

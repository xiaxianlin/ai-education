import { StudentDetailModel } from './models/page';
import { Entry } from './views/Entry';

export default function StudentDetailPage() {
  return (
    <StudentDetailModel.Provider>
      <Entry />
    </StudentDetailModel.Provider>
  );
}

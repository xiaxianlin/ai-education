import { PracticeSessionListModel } from './models/PageModel';
import { Main } from './views/Main';

export default function PracticeSessionListPage() {
  return (
    <PracticeSessionListModel.Provider>
      <Main />
    </PracticeSessionListModel.Provider>
  );
}


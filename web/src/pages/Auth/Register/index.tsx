import { RegisterModel } from './models/page';
import MainView from './views/Main';

export default function RegisterPage() {
  return (
    <RegisterModel.Provider>
      <MainView />
    </RegisterModel.Provider>
  );
}

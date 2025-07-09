import { LoginModel } from './models/page';
import MainView from './views/Main';

export default function LoginPage() {
  return (
    <LoginModel.Provider>
      <MainView />
    </LoginModel.Provider>
  );
}

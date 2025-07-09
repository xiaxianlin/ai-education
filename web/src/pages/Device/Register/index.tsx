import { DeviceRegisterModel } from './models/page';
import MainView from './views/Main';

export default function DeviceListPage() {
  return (
    <DeviceRegisterModel.Provider>
      <MainView />
    </DeviceRegisterModel.Provider>
  );
}

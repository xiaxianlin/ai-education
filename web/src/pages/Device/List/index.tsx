import { RobotCallModel } from './models/call';
import { DeviceListModel } from './models/page';
import MainView from './views/Main';

export default function DeviceListPage() {
  return (
    <DeviceListModel.Provider>
      <RobotCallModel.Provider>
        <MainView />
      </RobotCallModel.Provider>
    </DeviceListModel.Provider>
  );
}

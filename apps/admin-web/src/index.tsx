import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { history, Router } from './lib/router';
import { InitialStateModel } from './models/initialState';
import '../tailwind.css';
import './global.less';
import './global.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider>
    <InitialStateModel.Provider>
      <HistoryRouter history={history as any} >
        <Router />
      </HistoryRouter>
    </InitialStateModel.Provider>
  </ConfigProvider>
);


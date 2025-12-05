import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { history, Router } from './lib/router';
import { InitialStateModel } from './models/initialState';
import './global.less';
import './global.tsx';

const LoadingPage = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider>
    <InitialStateModel.Provider>
      <Suspense fallback={<LoadingPage />}>
        <HistoryRouter history={history as any} >
          <Router />
        </HistoryRouter>
      </Suspense>
    </InitialStateModel.Provider>
  </ConfigProvider>
);


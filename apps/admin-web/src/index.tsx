import './tailwind.css';
import './index.less';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Router } from './lib/router';
import { InitialStateModel } from './models/initialState';

import { history } from '@ai-education/shared-web';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#ff7a00',
        colorInfo: '#ff7a00',
        fontSize: 13,
        borderRadius: 4,
        wireframe: true,
        colorBorder: '#e2e8f0',
      },
      components: {
        Card: {
          colorBorderSecondary: '#eee',
        },
        Table: {
          headerBg: 'rgb(249,243,244)',
        },
      },
    }}
  >
    <InitialStateModel.Provider>
      <HistoryRouter history={history as any}>
        <Router />
      </HistoryRouter>
    </InitialStateModel.Provider>
  </ConfigProvider>,
);

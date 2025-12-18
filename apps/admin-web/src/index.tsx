import './tailwind.css';
import './index.less';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { Router } from './lib/router';
import { InitialStateModel } from './models/initialState';

import { history } from '@ai-education/shared-web';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      // algorithm: theme.darkAlgorithm,
      token: {
        borderRadius: 4,
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

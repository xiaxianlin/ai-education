import { ConfigProvider } from 'antd';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import './index.less';
import { Router } from './lib/router';

import { history } from '@ai-education/shared-web';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider
    theme={{
      token: {
        // colorPrimary: '#ff7a00',
        // colorInfo: '#ff7a00',
        // fontSize: 12,
        borderRadius: 4,
        wireframe: true,
        colorBorder: '#e2e8f0',
        colorLink: '#1677ff',
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
    <HistoryRouter history={history as any}>
      <Router />
    </HistoryRouter>
  </ConfigProvider>,
);

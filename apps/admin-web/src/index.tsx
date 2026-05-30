import { history } from '@ai-education/shared-web';
import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import './index.less';
import { Router } from './lib/router';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HistoryRouter history={history as any}>
    <Router />
  </HistoryRouter>,
);

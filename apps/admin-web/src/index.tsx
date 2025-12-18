import ReactDOM from 'react-dom/client';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { Router } from './lib/router';
import { InitialStateModel } from './models/initialState';
import '@ai-education/shared-web/types'; // 导入全局类型
import '../tailwind.css';
import './styles/theme.css';
import './global.less';
import './global.tsx';
import { history } from '@ai-education/shared-web';
import { AppThemeProvider } from '@/theme/AppThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppThemeProvider>
    <InitialStateModel.Provider>
      <HistoryRouter history={history as any}>
        <Router />
      </HistoryRouter>
    </InitialStateModel.Provider>
  </AppThemeProvider>,
);

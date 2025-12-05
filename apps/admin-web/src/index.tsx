import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { router } from './lib/router';
import './global.less';
import './global.tsx';

const LoadingPage = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider>
    <Suspense fallback={<LoadingPage />}>
      <RouterProvider router={router} />
    </Suspense>
  </ConfigProvider>
);


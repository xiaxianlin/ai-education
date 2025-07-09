import React from 'react';
import { Spin } from 'antd';

const PageLoading: React.FC = () => (
  <div style={{ paddingTop: 100, textAlign: 'center' }}>
    <Spin size="large" tip="加载中..." />
  </div>
);

export default PageLoading;

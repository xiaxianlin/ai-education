import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Result
      status="404"
      title="404"
      subTitle="页面走丢了～"
      extra={
        <Button type="primary" onClick={() => navigate('/home')}>
          回到首页
        </Button>
      }
    />
  );
};

export default NoFoundPage;

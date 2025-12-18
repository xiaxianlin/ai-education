import { useEffect } from 'react';
import { setAntdMessageApi, useAntdApp } from './antdApp';

export function AntdAppBridge() {
  const { message } = useAntdApp();

  useEffect(() => {
    setAntdMessageApi(message);
  }, [message]);

  return null;
}



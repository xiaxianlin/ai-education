import { api } from '@/utils/api';
import { useRequest } from 'ahooks';
import { message } from 'antd';

export function useSendPhoneCode() {
  const { runAsync: send } = useRequest((phone: string) => api.post('/user/send_sms', { phone }), {
    manual: true,
    onSuccess: (_, [phone]) => {
      message.success(`手机号 ${phone} 验证码发送成功!`);
    },
    onError: () => message.error('验证码发送失败！'),
  });

  return send;
}

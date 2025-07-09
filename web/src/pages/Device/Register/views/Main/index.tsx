import { Flex, Space, Input, Button } from 'antd';
import { DeviceForm } from '@/pages/Device/components';
import { useDeviceRegisterModel } from '../../models/page';

export default function MainView() {
  const { form, token, visible, show, hide, submit, setToken } = useDeviceRegisterModel();

  return (
    <>
      <Flex wrap="wrap" align="center" justify="center" style={{ height: '60vh' }}>
        <Space.Compact style={{ width: '70%' }}>
          <Input size="large" placeholder="请输入设备注册码" value={token} onChange={(e) => setToken(e.target.value)} />
          <Button size="large" type="primary" onClick={show}>
            注册
          </Button>
        </Space.Compact>
      </Flex>
      <DeviceForm form={form} visible={visible} onSure={submit} onCancel={hide} />
    </>
  );
}

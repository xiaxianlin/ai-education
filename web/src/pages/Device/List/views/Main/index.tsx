import { Flex, Empty, Spin } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { DeviceCard, DeviceForm } from '@/pages/Device/components';
import { useDeviceListModel } from '../../models/page';
import { useRobotCallModel } from '../../models/call';
import CallView from '../Call';

export default function MainView() {
  const { data, form, loading, visible, edit, modifyStatus, hide, submit } = useDeviceListModel();
  const { showCallDrawer } = useRobotCallModel();
  return (
    <PageContainer ghost header={{ title: '我的设备', breadcrumb: {} }}>
      <Spin spinning={loading}>
        <Flex wrap="wrap" gap="small" style={{ minHeight: 240 }}>
          {data?.data.map((d) => (
            <DeviceCard
              key={d.did}
              device={d}
              onEdit={() => edit(d)}
              onCall={() => showCallDrawer(d.robot!)}
              onStatusChange={(status) => modifyStatus(d.did, status)}
            />
          ))}
          {data?.data && !data.data.length && <Empty />}
        </Flex>
      </Spin>
      <DeviceForm form={form} visible={visible} onSure={submit} onCancel={hide} />
      <CallView />
    </PageContainer>
  );
}

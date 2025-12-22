import { useState } from 'react';
import { Button, Card, Empty, Flex, message, Modal } from 'antd';
import { ModalForm, ProForm, ProFormSelect } from '@ant-design/pro-components';
import { useStudentDetailModel } from '../models/page';
import { PracticeCard } from '../components/PracticeCard';
import { StudentApi } from '../../api';
import { useRequest } from 'ahooks';
import { PlusOutlined } from '@ant-design/icons';

export function PracticeList() {
  const { student } = useStudentDetailModel();
  const [visible, setVisible] = useState(false);
  const [form] = ProForm.useForm<{ practiceId: number }>();
  const { data, loading, refresh } = useRequest(() => StudentApi.getStudentPractices(student?.id || ''), {
    ready: !!student?.id,
  });

  const { data: unusedPractices } = useRequest(() => StudentApi.getStudentUnusedPractices(student?.id || ''), {
    ready: !!student?.id,
  });

  const { runAsync: handleAddPractice } = useRequest(
    (practiceId: number) => StudentApi.addStudentPractice(student?.id || '', practiceId),
    {
      manual: true,
      ready: !!student?.id,
      onSuccess: () => {
        message.success('关联成功');
        refresh();
        setVisible(false);
      },
    },
  );

  const { runAsync: removePractice } = useRequest(
    (practiceId: number) => StudentApi.removeStudentPractice(student?.id || '', practiceId),
    {
      manual: true,
      ready: !!student?.id,
      onSuccess: () => {
        message.success('移除成功');
        refresh();
      },
    },
  );

  const handleRemovePractice = (practiceId: number) => {
    Modal.confirm({
      title: '移除练习',
      content: '确定要从该学生中移除该练习吗？',
      onOk: () => removePractice(practiceId),
    });
  };

  return (
    <>
      <Card
        title="关联练习"
        loading={loading}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
            关联练习
          </Button>
        }
      >
        {data?.length && data.length > 0 ? (
          <Flex gap={16} wrap="wrap">
            {data.map((practice) => (
              <PracticeCard key={practice.id} practice={practice} onDelete={() => handleRemovePractice(practice.id)} />
            ))}
          </Flex>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#bfbfbf', fontSize: '14px' }}>暂无关联练习</span>}
            style={{ padding: '40px 0' }}
          />
        )}
      </Card>
      <ModalForm<{ practiceId: number }>
        size="large"
        width={600}
        form={form}
        open={visible}
        title="关联练习"
        layout="horizontal"
        onFinish={(values) => handleAddPractice(values.practiceId)}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            form.resetFields();
            setVisible(false);
          },
        }}
      >
        <div style={{ paddingTop: '16px' }} />
        <ProFormSelect
          showSearch
          name="practiceId"
          label="练习"
          placeholder="请选择练习"
          rules={[{ required: true, message: '请选择练习' }]}
          options={unusedPractices?.map((practice) => ({
            label: `${practice.name} (${practice.type})`,
            value: practice.id,
          }))}
        />
      </ModalForm>
    </>
  );
}

import { useState } from 'react';
import { Button, Card, Empty, Flex, message } from 'antd';
import { ModalForm, ProForm, ProFormText } from '@ant-design/pro-components';
import { useStudentDetailModel } from '../models/page';
import { TextbookCard } from '../components/TextbookCard';
import { StudentApi } from '@/services/student';
import { useRequest } from 'ahooks';

export function TextbookList() {
  const { student, textbook: activeTextbook } = useStudentDetailModel();
  const [visible, setVisible] = useState(false);
  const [form] = ProForm.useForm<{ textbookId: number }>();
  const { data, loading, refresh } = useRequest(() => StudentApi.getTextbooks(student?.id!), {
    ready: !!student?.id,
  });

  const { runAsync: handleAddTextbook } = useRequest(
    (textbookId: number) => StudentApi.addTextbook(student?.id!, textbookId),
    {
      manual: true,
      ready: !!student?.id,
      onSuccess: () => {
        message.success('添加成功');
        refresh();
        setVisible(false);
      },
    },
  );

  const { runAsync: handleRemoveTextbook } = useRequest(
    (textbookId: number) => StudentApi.removeTextbook(student?.id!, textbookId),
    {
      manual: true,
      ready: !!student?.id,
      onSuccess: () => {
        message.success('删除成功');
        refresh();
      },
    },
  );

  return (
    <>
      <Card
        title="关联教材"
        loading={loading}
        extra={
          <Button type="primary" onClick={() => setVisible(true)}>
            添加教材
          </Button>
        }
      >
        {data?.length && data.length > 0 ? (
          <Flex gap={16}>
            {data.map((textbook) => (
              <TextbookCard
                key={textbook.id}
                textbook={textbook}
                active={activeTextbook?.id === textbook.id}
                onDelete={() => handleRemoveTextbook(textbook.id)}
              />
            ))}
          </Flex>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ color: '#bfbfbf', fontSize: '14px' }}>暂无关联教材</span>}
            style={{ padding: '40px 0' }}
          />
        )}
      </Card>
      <ModalForm<{ textbookId: number }>
        size="large"
        width={600}
        form={form}
        open={visible}
        title="添加教材"
        layout="horizontal"
        onFinish={(values) => handleAddTextbook(values.textbookId)}
        modalProps={{
          destroyOnHidden: true,
          onCancel: () => {
            form.resetFields();
            setVisible(false);
          },
        }}
      >
        <div style={{ paddingTop: '16px' }} />
        <ProFormText
          name="textbookId"
          label="教材ID"
          placeholder="请输入教材ID"
          rules={[{ required: true, message: '请输入教材ID' }]}
        />
      </ModalForm>
    </>
  );
}

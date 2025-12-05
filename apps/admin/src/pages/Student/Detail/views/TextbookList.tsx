import { useState } from 'react';
import { Button, Card, Empty, Flex, message, Modal } from 'antd';
import { ModalForm, ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useStudentDetailModel } from '../models/page';
import { TextbookCard } from '../components/TextbookCard';
import { StudentApi } from '@/services/student';
import { useRequest } from 'ahooks';
import { GRADES } from '@/constants/course';

export function TextbookList() {
  const { student } = useStudentDetailModel();
  const [visible, setVisible] = useState(false);
  const [form] = ProForm.useForm<{ textbookId: number }>();
  const { data, loading, refresh } = useRequest(() => StudentApi.getTextbooks(student?.id!), {
    ready: !!student?.id,
  });

  const { data: unusedTextbooks } = useRequest(() => StudentApi.getUnusedTextbooks(student?.id!), {
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

  const { runAsync: removeTextbook } = useRequest(
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

  const handleRemoveTextbook = (textbookId: number) => {
    Modal.confirm({
      title: '删除教材',
      content: '确定要删除该教材吗？',
      onOk: () => removeTextbook(textbookId),
    });
  };

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
                active={textbook.grade === student?.grade}
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
        <ProFormSelect
          showSearch
          name="textbookId"
          label="教材"
          placeholder="请选择教材"
          rules={[{ required: true, message: '请选择教材' }]}
          options={unusedTextbooks?.map((textbook) => ({
            label: `${textbook.subject} | ${textbook.version} | ${GRADES[textbook.grade]} | ${
              textbook.semester
            }`,
            value: textbook.id,
          }))}
        />
      </ModalForm>
    </>
  );
}

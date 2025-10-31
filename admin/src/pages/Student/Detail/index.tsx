import { useParams, history } from '@umijs/max';
import {
  PageContainer,
  ProDescriptions,
  ProTable,
  ProColumns,
  ModalForm,
  ProFormSelect,
} from '@ant-design/pro-components';
import { StudentApi } from '@/services/student';
import { TextbookApi } from '@/services/textbook';
import { useRequest } from 'ahooks';
import { message, Button, Card, Space, Modal } from 'antd';
import { StatusTag } from '@/components/ui';
import { GRADES } from '@/constants/course';
import { useState } from 'react';
import { ProForm } from '@ant-design/pro-components';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [visible, setVisible] = useState(false);
  const [form] = ProForm.useForm<{ id: number }>();
  const [allTextbooks, setAllTextbooks] = useState<Textbook[]>([]);

  const { runAsync: loadStudent } = useRequest(
    async () => {
      const res = await StudentApi.search({ page: 1, size: 1000 });
      const student = res.data?.find((s) => s.id === id);
      if (!student) {
        throw new Error('学生不存在');
      }
      return student;
    },
    {
      manual: true,
      onError: () => {
        message.error('加载学生失败');
        history.back();
      },
    },
  );

  const { data: student, loading, refresh: refreshStudent } = useRequest(() => loadStudent(), {
    ready: !!id,
  });

  // 启用/禁用学生
  const { runAsync: handleToggleStatus, loading: toggling } = useRequest(
    async (status: number) => {
      await StudentApi.update(id!, { status });
    },
    {
      manual: true,
      onSuccess: (_, [status]) => {
        message.success(status === 1 ? '启用成功' : '停用成功');
        refreshStudent();
      },
      onError: () => {
        message.error('操作失败');
      },
    },
  );

  const handleUpdateStatus = () => {
    const newStatus = student?.status === 1 ? 0 : 1;
    Modal.confirm({
      centered: true,
      title: '状态变更',
      content: `确定要${newStatus === 1 ? '启用' : '停用'}该学生吗？`,
      onOk: () => handleToggleStatus(newStatus),
    });
  };

  const { loading: loadingTextbooks, run: refreshTextbooks } = useRequest(
    () => StudentApi.getTextbooks(id!),
    {
      ready: !!id,
      onSuccess: (data) => {
        setTextbooks(data || []);
      },
    },
  );

  // 加载所有教材列表用于选择（过滤掉已关联的）
  const { loading: loadingAllTextbooks } = useRequest(
    async () => {
      const res = await TextbookApi.search({ page: 1, size: 1000 });
      const allBooks = res.data || [];
      // 过滤掉已经关联的教材
      const availableBooks = allBooks.filter(
        (book) => !textbooks.some((tb) => tb.id === book.id),
      );
      setAllTextbooks(availableBooks);
      return availableBooks;
    },
    {
      ready: visible && !!id,
      refreshDeps: [textbooks],
    },
  );

  // 添加单个教材
  const { runAsync: handleAddTextbook, loading: adding } = useRequest(
    async (values: { id: number }) => {
      // 将新教材添加到现有列表
      const newTextbookIds = [...textbooks.map((t) => t.id), values.id];
      await StudentApi.saveTextbooks(id!, newTextbookIds);
    },
    {
      manual: true,
      onSuccess: () => {
        message.success('添加成功');
        setVisible(false);
        form.resetFields();
        refreshTextbooks();
      },
      onError: () => {
        message.error('添加失败');
      },
    },
  );

  // 删除教材
  const handleDeleteTextbook = (textbookId: number) => {
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: '确定要删除该教材关联吗？',
      okType: 'danger',
      onOk: async () => {
        try {
          // 从列表中移除该教材
          const newTextbookIds = textbooks.filter((t) => t.id !== textbookId).map((t) => t.id);
          await StudentApi.saveTextbooks(id!, newTextbookIds);
          message.success('删除成功');
          refreshTextbooks();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  if (loading) {
    return <PageContainer loading={loading} />;
  }

  if (!student) {
    return null;
  }

  const textbookColumns: ProColumns<Textbook>[] = [
    {
      title: '科目',
      dataIndex: 'subject',
      width: 100,
    },
    {
      title: '版本',
      dataIndex: 'version',
      width: 100,
    },
    {
      title: '年级',
      dataIndex: 'grade',
      width: 100,
      renderText: (grade) => GRADES[grade]?.grade || grade,
    },
    {
      title: '学期',
      dataIndex: 'semester',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status) => <StatusTag status={status === 1} />,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          size="small"
          type="link"
          danger
          onClick={() => handleDeleteTextbook(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title="学生详情"
      header={{
        breadcrumb: {},
        extra: [
          <Button
            key="status"
            type={student?.status === 1 ? 'default' : 'primary'}
            danger={student?.status === 1}
            loading={toggling}
            onClick={handleUpdateStatus}
          >
            {student?.status === 1 ? '停用' : '启用'}
          </Button>,
          <Button key="back" onClick={() => history.back()}>
            返回
          </Button>,
        ],
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large" className="simple-list-page">
        <Card title="基本信息">
          <ProDescriptions column={3}>
            <ProDescriptions.Item label="学生ID">{student.id}</ProDescriptions.Item>
            <ProDescriptions.Item label="姓名">{student.name}</ProDescriptions.Item>
            <ProDescriptions.Item label="手机号">{student.phone}</ProDescriptions.Item>
            <ProDescriptions.Item label="状态">
              <StatusTag status={student.status === 1} />
            </ProDescriptions.Item>
            <ProDescriptions.Item label="创建时间" valueType="dateTime">
              {student.create_time * 1000}
            </ProDescriptions.Item>
            {student.update_time && (
              <ProDescriptions.Item label="更新时间" valueType="dateTime">
                {student.update_time * 1000}
              </ProDescriptions.Item>
            )}
          </ProDescriptions>
        </Card>

        <Card
          title="关联教材"
          loading={loadingTextbooks}
          extra={
            <Button type="primary" onClick={() => setVisible(true)}>
              添加教材
            </Button>
          }
        >
          <ProTable<Textbook>
            rowKey="id"
            columns={textbookColumns}
            search={false}
            pagination={false}
            dataSource={textbooks}
            options={false}
            toolbar={{ actions: [] }}
          />
        </Card>
      </Space>

      <ModalForm<{ id: number }>
        width={600}
        form={form}
        open={visible}
        title="添加教材"
        onFinish={handleAddTextbook}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setVisible(false);
            form.resetFields();
          },
        }}
        layout="horizontal"
        size="large"
        labelAlign="left"
        labelCol={{ span: 4 }}
      >
        <div className="pt-3" />
        <ProFormSelect
          name="id"
          label="教材"
          placeholder={loadingAllTextbooks ? '加载中...' : '请选择教材'}
          fieldProps={{
            showSearch: true,
            loading: loadingAllTextbooks,
            disabled: loadingAllTextbooks,
          }}
          options={allTextbooks.map((textbook) => {
            const gradeInfo = GRADES[textbook.grade];
            const label = `${textbook.subject} - ${textbook.version} - ${gradeInfo?.grade || textbook.grade}年级 - ${textbook.semester}`;
            return {
              label,
              value: textbook.id,
            };
          })}
          rules={[{ required: true, message: '请选择教材' }]}
        />
      </ModalForm>
    </PageContainer>
  );
}


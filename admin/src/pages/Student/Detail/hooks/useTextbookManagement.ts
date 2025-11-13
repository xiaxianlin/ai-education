import { useState } from 'react';
import { ProForm } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { message, Modal } from 'antd';

import { StudentApi } from '@/services/student';
import { TextbookApi } from '@/services/textbook';

export function useTextbookManagement(id?: string) {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [allTextbooks, setAllTextbooks] = useState<Textbook[]>([]);
  const [visible, setVisible] = useState(false);
  const [form] = ProForm.useForm<{ ids: number[] }>();

  const {
    data: textbooksData,
    loading: loadingTextbooks,
    refresh: refreshTextbooks,
  } = useRequest(() => StudentApi.getTextbooks(id!), {
    ready: !!id,
    onSuccess: (data) => {
      setTextbooks(data || []);
    },
  });

  const { loading: loadingAllTextbooks } = useRequest(
    async () => {
      const res = await TextbookApi.search({ page: 1, size: 1000 });
      const allBooks = res.data || [];
      const availableBooks = allBooks.filter((book) => !textbooks.some((tb) => tb.id === book.id));
      setAllTextbooks(availableBooks);
      return availableBooks;
    },
    {
      ready: visible && !!id,
      refreshDeps: [textbooks],
    },
  );

  const { runAsync: handleAddTextbook, loading: adding } = useRequest(
    async (values: { ids: number[] }) => {
      const existingIds = textbooks.map((t) => t.id);
      const newTextbookIds = [
        ...existingIds,
        ...values.ids.filter((textbookId) => !existingIds.includes(textbookId)),
      ];
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

  const handleDeleteTextbook = (textbookId: number) => {
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: '确定要删除该教材关联吗？',
      okType: 'danger',
      onOk: async () => {
        try {
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

  const {
    data: profile,
    loading: loadingProfile,
    refresh: refreshProfile,
  } = useRequest(() => StudentApi.getProfile(id!), {
    ready: !!id,
  });

  return {
    textbooks,
    allTextbooks,
    loadingTextbooks,
    loadingAllTextbooks,
    profile,
    loadingProfile,
    refreshProfile,
    handleDeleteTextbook,
    visible,
    setVisible,
    form,
    adding,
    handleAddTextbook,
  };
}


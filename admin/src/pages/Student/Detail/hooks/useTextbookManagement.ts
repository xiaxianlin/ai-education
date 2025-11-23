import { useState, useEffect } from 'react';
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

  const {
    data: profile,
    loading: loadingProfile,
    refresh: refreshProfile,
  } = useRequest(() => StudentApi.getProfile(id!), {
    ready: !!id,
  });

  // 如果当前学习教材不在关联教材列表中，需要获取并添加
  useEffect(() => {
    const loadCurrentTextbook = async () => {
      // 等待 textbooks 和 profile 都加载完成
      if (!id || !profile?.current_textbook_id || loadingTextbooks || loadingProfile) {
        return;
      }

      const currentTextbookId = profile.current_textbook_id;
      
      // 检查当前教材是否已在列表中
      setTextbooks((prev) => {
        const isInList = prev.some((tb) => tb.id === currentTextbookId);
        if (isInList) {
          return prev;
        }
        
        // 如果不在列表中，异步获取并添加
        TextbookApi.get(currentTextbookId)
          .then((currentTextbook) => {
            if (currentTextbook) {
              setTextbooks((current) => {
                // 再次检查避免重复添加（可能在异步过程中已经添加）
                if (current.some((tb) => tb.id === currentTextbookId)) {
                  return current;
                }
                return [...current, currentTextbook];
              });
            }
          })
          .catch((error) => {
            console.error('获取当前学习教材失败:', error);
          });
        
        return prev;
      });
    };

    loadCurrentTextbook();
  }, [id, profile?.current_textbook_id, loadingTextbooks, loadingProfile, textbooks.length]);

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


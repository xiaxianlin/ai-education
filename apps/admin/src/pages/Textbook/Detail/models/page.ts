import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { adminApi } from '@ai-education/shared-api-client';
import { useNavigate, useParams } from '@umijs/max';
import { useState } from 'react';
import { useGenerateWithConfirm } from '@/hooks/useGenerateWithConfirm';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const {
    data: textbook,
    loading,
    refresh,
  } = useRequest(() => adminApi.getTextbook(Number(id)), {
    ready: !!id,
  });

  const { runAsync: deleteTextbook } = useRequest(adminApi.deleteTextbook, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      navigate('/course/textbook');
    },
  });
  const { loading: parsing, runAsync: parse } = useRequest(adminApi.parseTextbook, {
    manual: true,
    onSuccess: () => {
      message.success('解析完成');
      refresh();
    },
  });


  const { loading: uploading, run: upload } = useRequest(
    (data) => adminApi.uploadTextbook(textbook!.id, data),
    {
      manual: true,
      onSuccess: () => {
        message.success('上传成功');
        refresh();
      },
    },
  );

  const handleDelete = () => {
    if (!textbook) return;
    Modal.confirm({
      centered: true,
      title: '删除确认',
      content: `确定要删除该教材吗？`,
      okType: 'danger',
      onOk: () => {
        deleteTextbook(textbook.id);
      },
    });
  };


  const handleParse = () => {
    if (!textbook) return;
    Modal.confirm({
      centered: true,
      title: '解析教材',
      content: textbook.is_parsed
        ? `当前教材已经被解析过，再次解析会覆盖当前所有内容，确定要解析吗？`
        : `确定要解析当前教材吗？`,
      onOk: () => {
        parse(textbook.id);
      },
    });
  };

  const handleGenerateQuestions = useGenerateWithConfirm(
    async () => {
      if (!textbook) return;
      return await adminApi.generateTextbookQuestions(textbook.id);
    },
    {
      confirmTitle: '生成题目',
      confirmContent: '确定要为该教材生成题目吗？生成过程可能需要一些时间，请耐心等待。',
      loadingTitle: '正在生成题目',
      loadingContent: '题目生成中，请稍候...',
      successTitle: '生成成功',
      successContent: '题目生成完成！',
      errorTitle: '生成失败',
      onSuccess: () => {
        refresh();
      },
    },
  );

  return {
    id: Number(id),
    units,
    loading,
    parsing,
    textbook,
    uploading,
    upload,
    setUnits,
    handleParse,
    handleDelete,
    handleGenerateQuestions,
  };
};

export const TextbookDetailModel = createContainer(useContainer);
export const useTextbookDetailModel = TextbookDetailModel.useContainer;

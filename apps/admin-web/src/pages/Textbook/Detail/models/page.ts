import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { adminApi } from '@/lib/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useGenerateWithConfirm } from '@/hooks/useGenerateWithConfirm';
import { useAntdApp } from '@/lib/antdApp';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { message, modal } = useAntdApp();
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
      navigate('/textbook');
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
    modal.confirm({
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
    modal.confirm({
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
  };
};

export const TextbookDetailModel = createContainer(useContainer);
export const useTextbookDetailModel = TextbookDetailModel.useContainer;

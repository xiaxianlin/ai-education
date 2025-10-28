import { message, Modal } from 'antd';
import { useRequest } from 'ahooks';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '@/services/textbook';
import { useSimpleForm } from '@/hooks';
import { useNavigate, useParams } from '@umijs/max';
import { useState } from 'react';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const {
    data: textbook,
    loading,
    refresh,
  } = useRequest(() => TextbookApi.get(Number(id)), {
    ready: !!id,
  });

  const { runAsync: deleteTextbook } = useRequest(TextbookApi.delete, {
    manual: true,
    onSuccess: () => {
      message.success('删除成功');
      navigate('/course/textbook');
    },
  });
  const { loading: parsing, runAsync: parse } = useRequest(TextbookApi.parse, {
    manual: true,
    onSuccess: () => {
      message.success('解析完成');
      refresh();
    },
  });

  const { runAsync: toggleStatus } = useRequest(TextbookApi.toggleStatus, {
    manual: true,
    onSuccess: (_, [_id, status]) => {
      message.success(status ? '启用成功' : '停用成功');
      refresh();
    },
  });

  const { loading: uploading, run: upload } = useRequest(
    (data) => TextbookApi.upload(textbook!.id, data),
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

  const updateStatus = () => {
    if (!textbook) return;
    Modal.confirm({
      centered: true,
      title: '状态变更',
      content: `确定要${textbook.status ? '停用' : '启用'}该教材吗？`,
      onOk: () => toggleStatus(textbook.id, textbook.status ? 0 : 1),
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
    updateStatus,
  };
};

export const TextbookDetailModel = createContainer(useContainer);
export const useTextbookDetailModel = TextbookDetailModel.useContainer;

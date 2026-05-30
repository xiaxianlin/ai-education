import { toast } from '@/components/ui/toast';
import { useRequest } from 'ahooks';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '../../api';

const useContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const {
    data: textbook,
    loading,
    refresh,
  } = useRequest(() => TextbookApi.getTextbook(Number(id)), {
    ready: !!id,
  });

  const { runAsync: deleteTextbook } = useRequest(TextbookApi.deleteTextbook, {
    manual: true,
    onSuccess: () => {
      toast.success('删除成功');
      navigate('/textbook');
    },
  });
  const { loading: parsing, runAsync: parse } = useRequest(TextbookApi.parseTextbook, {
    manual: true,
    onSuccess: () => {
      toast.success('解析完成');
      refresh();
    },
  });

  const { loading: uploading, run: upload } = useRequest((data) => TextbookApi.uploadTextbook(textbook!.id, data), {
    manual: true,
    onSuccess: () => {
      toast.success('上传成功');
      refresh();
    },
  });

  const handleDelete = () => {
    if (!textbook) return;
    if (window.confirm('确定要删除该教材吗？')) {
      deleteTextbook(textbook.id);
    }
  };

  const handleParse = () => {
    if (!textbook) return;
    const content = textbook.is_parsed
      ? '当前教材已经被解析过，再次解析会覆盖当前所有内容，确定要解析吗？'
      : '确定要解析当前教材吗？';
    if (window.confirm(content)) {
      parse(textbook.id);
    }
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

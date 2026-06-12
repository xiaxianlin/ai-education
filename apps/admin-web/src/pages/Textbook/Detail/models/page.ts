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

  const handleDelete = () => {
    if (!textbook) return;
    if (window.confirm('确定要删除该教材吗？')) {
      deleteTextbook(textbook.id);
    }
  };

  return {
    id: Number(id),
    units,
    loading,
    textbook,
    setUnits,
    handleDelete,
  };
};

export const TextbookDetailModel = createContainer(useContainer);
export const useTextbookDetailModel = TextbookDetailModel.useContainer;

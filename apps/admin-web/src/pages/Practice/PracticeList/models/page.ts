import { toast } from '@/components/ui/toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';

// 练习类型配置
const PRACTICE_TYPES = [
  { key: 'all', label: '全部练习' },
  { key: 'ability_practice', label: '能力练习' },
  { key: 'unit_practice', label: '单元练习' },
];

const useContainer = () => {
  const navigate = useNavigate();
  const [practiceType, setPracticeType] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((key) => key + 1);

  const handleTabChange = (key: string) => {
    setPracticeType(key);
    refresh();
  };

  const handleViewDetail = (id: string) => {
    navigate(`/practice/detail/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await PracticeApi.deletePractice(id);
      toast.success('删除成功');
      refresh();
      return true;
    } catch (error: any) {
      toast.error(error?.message || '删除失败');
      return false;
    }
  };

  return {
    navigate,
    practiceType,
    refreshKey,
    practiceTypes: PRACTICE_TYPES,
    handleTabChange,
    handleViewDetail,
    handleDelete,
  };
};

export const PracticeListModel = createContainer(useContainer);
export const usePracticeListModel = PracticeListModel.useContainer;

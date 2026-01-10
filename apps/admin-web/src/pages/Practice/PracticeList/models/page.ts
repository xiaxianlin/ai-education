import { ActionType } from '@ant-design/pro-components';
import { useRef, useState } from 'react';
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
  const actionRef = useRef<ActionType>();
  const [practiceType, setPracticeType] = useState<string>('all');

  const handleTabChange = (key: string) => {
    setPracticeType(key);
    actionRef.current?.reload();
  };

  const handleViewDetail = (id: string) => {
    navigate(`/practice/detail/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await PracticeApi.deletePractice(id);
      actionRef.current?.reload();
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    navigate,
    actionRef,
    practiceType,
    practiceTypes: PRACTICE_TYPES,
    handleTabChange,
    handleViewDetail,
    handleDelete,
  };
};

export const PracticeListModel = createContainer(useContainer);
export const usePracticeListModel = PracticeListModel.useContainer;

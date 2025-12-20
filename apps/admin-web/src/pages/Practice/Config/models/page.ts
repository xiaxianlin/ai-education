import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { message } from 'antd';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const [loading, setLoading] = useState(false);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [editingPractice, setEditingPractice] = useState<Practice | null>(null);
  const [configLoading, setConfigLoading] = useState(false);

  const loadPractices = async () => {
    setLoading(true);
    try {
      const data = await adminApi.listPractices({ page: 1, size: 1000 });
      setPractices(data?.data || []);
    } catch (error) {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPractices();
  }, []);

  const handleOpenConfig = (practice: Practice) => {
    setEditingPractice(practice);
    setConfigDrawerOpen(true);
  };

  const handleCloseConfig = () => {
    setConfigDrawerOpen(false);
    setEditingPractice(null);
  };

  const handleSaveConfig = async (config: Record<string, any>) => {
    if (!editingPractice) return;
    
    setConfigLoading(true);
    try {
      await adminApi.updatePracticeConfig(editingPractice.id, { config });
      message.success('配置保存成功');
      handleCloseConfig();
      loadPractices();
    } catch (error) {
      // error handled by interceptor
    } finally {
      setConfigLoading(false);
    }
  };

  return {
    loading,
    practices,
    configDrawerOpen,
    editingPractice,
    configLoading,
    loadPractices,
    handleOpenConfig,
    handleCloseConfig,
    handleSaveConfig,
  };
};

export const PracticeConfigModel = createContainer(useContainer);
export const usePracticeConfigModel = PracticeConfigModel.useContainer;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { message } from 'antd';
import { adminApi } from '@/lib/api';

const useContainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<PromptDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadPrompt(Number(id));
    }
  }, [id]);

  const loadPrompt = async (versionId: number) => {
    setLoading(true);
    try {
      const data = await adminApi.getPromptDetail(versionId);
      setPrompt(data);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!prompt) return;
    try {
      await adminApi.publishPromptVersion(prompt.version_id);
      message.success('发布成功');
      loadPrompt(prompt.version_id);
    } catch (error) {
      message.error('发布失败');
    }
  };

  return {
    prompt,
    loading,
    handlePublish,
    navigate,
  };
};

export const PromptDetailModel = createContainer(useContainer);
export const usePromptDetailModel = PromptDetailModel.useContainer;


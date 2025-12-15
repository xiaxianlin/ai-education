import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Form, Input, message, Space, Button } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { adminApi } from '@/lib/api';
import { PromptForm } from '../Detail/components/PromptForm';
import { PromptVersionForm } from '../Detail/components/PromptVersionForm';

import { VersionFormValues } from '../types';

export default function PromptFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [basicForm] = Form.useForm<Prompt>();
  const [versionForm] = Form.useForm<VersionFormValues>();

  const fetchData = async (promptId: number) => {
    const p = await adminApi.getPrompt(promptId);
    setPrompt(p);
    basicForm.setFieldsValue({
      name: p.name,
      slug: p.slug,
      category: p.category,
      description: p.description,
      tags: p.tags?.join(','),
    } as any);
  };

  useEffect(() => {
    if (!isNew && id) {
      fetchData(Number(id));
    }
  }, [id, isNew]);

  const handleCreatePrompt = async () => {
    const values = await basicForm.validateFields();
    const versionValues = await versionForm.validateFields();
    const payload: CreatePromptRequest = {
      name: values.name!,
      slug: values.slug!,
      category: values.category!,
      description: values.description,
      tags: (values as any).tags
        ? (values as any).tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [],
      template: versionValues.template,
      system_prompt: versionValues.system_prompt,
      negative_prompt: versionValues.negative_prompt,
      input_schema: versionValues.input_schema ? JSON.parse(versionValues.input_schema) : {},
      sampling_params: versionValues.sampling_params ? JSON.parse(versionValues.sampling_params) : {},
      timeout_ms: versionValues.timeout_ms,
      changelog: versionValues.changelog,
    };
    const created = await adminApi.createPrompt(payload);
    message.success('创建成功');
    navigate(`/prompt/detail/${created.id}`, { replace: true });
  };

  const handleUpdatePrompt = async () => {
    if (!prompt) return;
    const values = await basicForm.validateFields();
    await adminApi.updatePrompt(prompt.id, {
      name: values.name,
      category: values.category,
      description: values.description,
      tags: (values as any).tags
        ? (values as any).tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [],
    });
    message.success('更新成功');
    fetchData(prompt.id);
  };

  return (
    <PageContainer title={isNew ? '新建提示词' : `编辑提示词：${prompt?.name || ''}`}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <ProCard title="基础信息">
          <PromptForm isNew={isNew} form={basicForm} onCreate={handleCreatePrompt} onUpdate={handleUpdatePrompt} />
        </ProCard>
        {isNew && (
          <ProCard title="初始版本">
            <PromptVersionForm form={versionForm} />
            <Button type="primary" onClick={handleCreatePrompt} style={{ marginTop: 16 }}>
              创建 Prompt
            </Button>
          </ProCard>
        )}
      </Space>
    </PageContainer>
  );
}

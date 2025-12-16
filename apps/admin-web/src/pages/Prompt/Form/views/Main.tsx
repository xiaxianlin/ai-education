import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { usePromptFormModel } from '../models/page';
import { PageHeader } from '@/components/business';
import { adminApi } from '@/lib/api';

export default function MainView() {
  const { versionId, handleSubmit } = usePromptFormModel();

  return (
    <PageContainer title={<PageHeader title={!versionId ? '新建提示词' : `编辑提示词`} />}>
      <ProCard>
        <ProForm<SavePromptRequest>
          size="large"
          labelCol={{ span: 4 }}
          onFinish={handleSubmit}
          request={async () => {
            if (!versionId) {
              return {};
            }
            const { model_params, ...data } = await adminApi.getPromptDetail(versionId);
            return {
              ...data,
              model_params: model_params ? JSON.stringify(model_params) : undefined,
            };
          }}
        >
          <ProForm.Group>
            <ProFormText name="name" label="名称" rules={[{ required: true }]} width="lg" />
            <ProFormText name="slug" label="Slug" rules={[{ required: true }]} width="lg" disabled={!!versionId} />
            <ProFormSelect
              name="type"
              label="类型"
              rules={[{ required: true }]}
              width="lg"
              options={[
                { value: 'system', label: '系统提示词' },
                { value: 'user', label: '用户提示词' },
              ]}
            />
          </ProForm.Group>

          <ProFormTextArea
            name="template_content"
            label="模板内容"
            rules={[{ required: true }]}
            fieldProps={{ rows: 16 }}
          />
          <ProForm.Group>
            <ProFormTextArea name="negative_content" label="负面提示" fieldProps={{ rows: 4 }} width="lg" />
            <ProFormTextArea name="model_params" label="模型参数" fieldProps={{ rows: 4 }} width="lg" />
            <ProFormTextArea name="description" label="描述" fieldProps={{ rows: 4 }} width="lg" />
          </ProForm.Group>
        </ProForm>
      </ProCard>
    </PageContainer>
  );
}

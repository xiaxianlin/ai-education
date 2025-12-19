import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { usePromptFormModel } from '../models/page';
import { PageHeader } from '@/components';
import { adminApi } from '@/lib/api';
import { Flex } from 'antd';

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
          <Flex className="form-group-inline">
            <ProFormTextArea
              name="template_content"
              label="模板内容"
              rules={[{ required: true }]}
              fieldProps={{ rows: 32 }}
            />
            <div>
              <ProFormText name="name" label="名称" rules={[{ required: true }]} width="lg" />
              <ProFormText name="slug" label="Slug" rules={[{ required: true }]} />
              <ProFormSelect
                name="type"
                label="类型"
                rules={[{ required: true }]}
                options={[
                  { value: 'system', label: '系统提示词' },
                  { value: 'user', label: '用户提示词' },
                ]}
              />
              <ProFormTextArea
                name="description"
                label="描述"
                fieldProps={{ rows: 3, placeholder: '可选，对提示词的用途和使用场景进行说明' }}
                width="md"
              />
              <ProFormTextArea
                name="negative_content"
                label="负面提示"
                fieldProps={{ rows: 3, placeholder: '可选，用于指定模型需要避免的内容说明' }}
              />
              <ProFormTextArea
                name="model_params"
                label="模型参数"
                fieldProps={{ rows: 3, placeholder: '{"temperature": 0.7, "max_tokens": 1024}' }}
                rules={[
                  {
                    validator: async (_: any, value?: string) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      try {
                        JSON.parse(value);
                        return Promise.resolve();
                      } catch {
                        return Promise.reject(new Error('请输入合法的 JSON 格式'));
                      }
                    },
                  },
                ]}
              />
            </div>
          </Flex>
        </ProForm>
      </ProCard>
    </PageContainer>
  );
}

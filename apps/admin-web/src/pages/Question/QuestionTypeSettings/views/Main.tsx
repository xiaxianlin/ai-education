import { JsonEditor, MarkdownEditor } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Spin } from 'antd';
import { useQuestionTypeSettingsModel } from '../models/page';

export default function MainView() {
  const {
    type,
    saving,
    loading,
    pageTitle,
    promptValue,
    configsValue,
    savePrompt,
    saveConfigs,
    setPromptValue,
    setConfigsValue,
  } = useQuestionTypeSettingsModel();

  return (
    <PageContainer title={pageTitle}>
      <Spin spinning={loading || saving}>
        {/* Prompt 配置 */}
        {type === 'prompt' && (
          <Card
            title="Prompt 配置"
            extra={
              <Button type="primary" onClick={savePrompt}>
                保存
              </Button>
            }
          >
            <MarkdownEditor value={promptValue} onChange={setPromptValue} height="600px" maxHeight="800px" />
          </Card>
        )}

        {type === 'configs' && (
          <Card
            title="Configs 配置"
            extra={
              <Button type="primary" onClick={saveConfigs}>
                保存
              </Button>
            }
          >
            <JsonEditor value={configsValue} onChange={setConfigsValue} height="400px" maxHeight="600px" />
          </Card>
        )}
      </Spin>
    </PageContainer>
  );
}

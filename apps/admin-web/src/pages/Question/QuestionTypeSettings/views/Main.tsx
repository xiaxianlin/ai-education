import { JsonEditor, MarkdownEditor } from '@/components';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Spin } from 'antd';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuestionTypeSettingsModel } from '../models/page';

export default function MainView() {
  const {
    loading,
    promptValue,
    setPromptValue,
    savingPrompt,
    handleSavePrompt,
    configsValue,
    setConfigsValue,
    savingConfigs,
    handleSaveConfigs,
    pageTitle,
  } = useQuestionTypeSettingsModel();

  const location = useLocation();
  const promptCardRef = useRef<HTMLDivElement>(null);
  const configsCardRef = useRef<HTMLDivElement>(null);

  // 根据 hash 滚动到对应的编辑器
  useEffect(() => {
    if (location.hash === '#prompt' && promptCardRef.current) {
      setTimeout(() => {
        promptCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (location.hash === '#configs' && configsCardRef.current) {
      setTimeout(() => {
        configsCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <PageContainer title={pageTitle}>
      <Spin spinning={loading}>
        <div className="space-y-4">
          {/* Prompt 配置 */}
          <div ref={promptCardRef}>
            <Card title="Prompt 配置" extra={<Button type="primary" onClick={handleSavePrompt} loading={savingPrompt}>保存</Button>}>
              <MarkdownEditor value={promptValue} onChange={setPromptValue} height="600px" maxHeight="800px" />
            </Card>
          </div>

          {/* Configs 配置 */}
          <div ref={configsCardRef}>
            <Card title="Configs 配置" extra={<Button type="primary" onClick={handleSaveConfigs} loading={savingConfigs}>保存</Button>}>
              <JsonEditor value={configsValue} onChange={setConfigsValue} height="400px" maxHeight="600px" />
            </Card>
          </div>
        </div>
      </Spin>
    </PageContainer>
  );
}

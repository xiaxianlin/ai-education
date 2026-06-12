import { JsonEditor, MarkdownEditor } from '@/components';
import { Button, Card, CardContent, CardHeader, CardTitle, PageShell } from '@/components/ui';
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
    <PageShell title={pageTitle}>
      {loading || saving ? <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">处理中...</div> : null}

      {type === 'prompt' ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Prompt 配置</CardTitle>
            <Button onClick={savePrompt} disabled={saving}>
              保存
            </Button>
          </CardHeader>
          <CardContent>
            <MarkdownEditor value={promptValue} onChange={setPromptValue} height="600px" maxHeight="800px" />
          </CardContent>
        </Card>
      ) : null}

      {type === 'configs' ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Configs 配置</CardTitle>
            <Button onClick={saveConfigs} disabled={saving}>
              保存
            </Button>
          </CardHeader>
          <CardContent>
            <JsonEditor value={configsValue} onChange={setConfigsValue} height="400px" maxHeight="600px" />
          </CardContent>
        </Card>
      ) : null}
    </PageShell>
  );
}

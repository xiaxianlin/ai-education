import { JsonEditor, JsonViewer } from '@/components';
import { Button, Card, CardContent, CardHeader, CardTitle, Modal, PageShell } from '@/components/ui';
import '@uiw/react-md-editor/markdown-editor.css';
import { useQuestionGenerateModel } from '../models/page';

export default function MainView() {
  const {
    code,
    inputJson,
    setInputJson,
    result,
    loading,
    handleGenerate,
    promptModalVisible,
    promptContent,
    promptLoading,
    handleShowPrompt,
    handleClosePrompt,
  } = useQuestionGenerateModel();

  return (
    <PageShell
      title={`题目生成 - ${code || ''}`}
      actions={
        <Button variant="ghost" onClick={handleShowPrompt}>
          查看指令
        </Button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Card
        >
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>设置参数</CardTitle>
            <Button disabled={loading} onClick={handleGenerate}>
              {loading ? '生成中...' : '生成题目'}
            </Button>
          </CardHeader>
          <CardContent>
            <JsonEditor value={inputJson} onChange={setInputJson} height="700px" disabled={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="py-20 text-center text-sm text-muted-foreground">生成中...</div> : null}
            {!loading && result ? <JsonViewer value={result} height="700px" /> : null}
            {!loading && !result ? <div className="py-20 text-center text-sm text-muted-foreground">暂无生成结果</div> : null}
          </CardContent>
        </Card>
      </div>

      <Modal open={promptModalVisible} title="查看指令" onClose={handleClosePrompt}>
        {promptLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">加载中...</div>
        ) : (
          <pre className="max-h-[600px] whitespace-pre-wrap break-all rounded-md bg-muted p-4 text-sm leading-6 text-foreground">
            {promptContent}
          </pre>
        )}
      </Modal>
    </PageShell>
  );
}

import { JsonEditor, JsonViewer } from '@/components';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import '@uiw/react-md-editor/markdown-editor.css';
import { Button, Empty, Flex, Modal } from 'antd';
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
    <PageContainer
      title={`题目生成 - ${code || ''}`}
      header={{ breadcrumb: {} }}
      extra={
        <Button type="link" onClick={handleShowPrompt}>
          查看指令
        </Button>
      }
    >
      <Flex gap={16} vertical>
        <ProCard
          bordered
          title="设置参数"
          extra={
            <Button type="primary" loading={loading} onClick={handleGenerate}>
              生成题目
            </Button>
          }
        >
          <JsonEditor value={inputJson} onChange={setInputJson} height="200px" disabled={loading} />
        </ProCard>

        <ProCard title="生成结果" loading={loading} bordered>
          {result ? <JsonViewer value={result} height="600px" collapsed={2} /> : <Empty description="暂无生成结果" />}
        </ProCard>
      </Flex>

      <Modal
        title="查看指令"
        open={promptModalVisible}
        onCancel={handleClosePrompt}
        footer={null}
        width={800}
        loading={promptLoading}
      >
        <pre className="break-all whitespace-pre-wrap leading-[1.2] max-h-[600px] overflow-auto">
          {promptContent}
        </pre>
      </Modal>
    </PageContainer>
  );
}

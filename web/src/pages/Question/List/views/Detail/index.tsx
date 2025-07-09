import { Button, Drawer } from 'antd';
import { useQuestionListModel } from '../../models/page';
import { ProCard } from '@ant-design/pro-components';
import { formatMarkdown } from '@/utils/format';
import { useDomDownload } from '@/hooks';

export default function DetailView() {
  const {
    state: { visible, question, detailLoading },
    hideDetail,
  } = useQuestionListModel();
  const { reasoning, answer } = question || {};

  const { ref, loading, download } = useDomDownload();

  return (
    <Drawer
      closable
      destroyOnHidden
      size="large"
      open={visible}
      title="问题详情"
      placement="right"
      onClose={hideDetail}
      loading={detailLoading}
      extra={
        <Button loading={loading} type="primary" onClick={() => download()}>
          下载结果
        </Button>
      }
    >
      {reasoning && (
        <ProCard bordered collapsible headerBordered title="AI 思考" style={{ marginBottom: 16 }}>
          <div id="ai-reasoning" dangerouslySetInnerHTML={{ __html: formatMarkdown(reasoning) }} />
        </ProCard>
      )}
      {answer && (
        <ProCard ref={ref} bordered headerBordered title="最终结果">
          <div id="ai-answer" dangerouslySetInnerHTML={{ __html: formatMarkdown(answer) }} />
        </ProCard>
      )}
    </Drawer>
  );
}

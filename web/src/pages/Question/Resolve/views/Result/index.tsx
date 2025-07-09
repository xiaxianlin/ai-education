import { Empty, Flex, Spin, Image } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import { useQuestionResolveModel } from '../../models/page';
import styles from './index.less';
export default function ResultView() {
  const { file, answering, thinking, uploading } = useQuestionResolveModel();
  return (
    <Spin size="large" spinning={uploading} tip="图片上传中">
      <Flex vertical gap={16} className={styles.result} id="ai-panel">
        {file && thinking && <Image style={{ maxHeight: 36 }} src={URL.createObjectURL(file)} />}
        <ProCard bordered collapsible headerBordered title="AI 思考" style={{ display: thinking ? 'block' : 'none' }}>
          <div id="ai-reasoning" />
        </ProCard>
        <ProCard bordered headerBordered title="最终结果" style={{ display: answering ? 'block' : 'none' }}>
          <div id="ai-answer" />
        </ProCard>
        {!answering && !thinking && (
          <Flex vertical gap={16} justify="center" align="center" style={{ height: '60vh' }}>
            <Empty
              description={
                <Flex vertical gap={4}>
                  <div>请先上传数学问题图片</div>
                  <div>AI 将自动识别图片中的数学问题</div>
                </Flex>
              }
            />
          </Flex>
        )}
      </Flex>
    </Spin>
  );
}

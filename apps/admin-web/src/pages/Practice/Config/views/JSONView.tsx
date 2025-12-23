import { Input, Flex, Card } from 'antd';
import { usePracticeConfigModel } from '../models/page';
import JsonView from '@uiw/react-json-view';

const { TextArea } = Input;

export function JSONView() {
  const { parameters, jsonText, jsonError, handleJsonChange } = usePracticeConfigModel();

  return (
    <>
      <Flex
        gap={16}
        style={{
          height: 'calc(100vh - 240px)',
          minHeight: '500px',
        }}
      >
        <TextArea
          value={jsonText}
          onChange={handleJsonChange}
          placeholder="请输入 JSON 格式的参数配置"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
            fontSize: '13px',
            flex: 1,
            height: '100%',
            resize: 'none',
          }}
        />
        <Card
          style={{
            flex: 1,
            height: '100%',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
          bodyStyle={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
          }}
        >
          <JsonView value={parameters} />
        </Card>
      </Flex>
      {jsonError && <div style={{ color: '#ff4d4f', fontSize: 12 }}>JSON 格式错误: {jsonError}</div>}
    </>
  );
}

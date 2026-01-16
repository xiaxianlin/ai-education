import JsonView from '@uiw/react-json-view';

interface JsonViewerProps {
  value?: any;
  height?: string;
  maxHeight?: string;
  collapsed?: number;
  displayDataTypes?: boolean;
  displayObjectSize?: boolean;
  enableClipboard?: boolean;
}

export function JsonViewer({
  value,
  height = '400px',
  maxHeight = '800px',
  collapsed = 2,
  displayDataTypes = false,
  displayObjectSize = false,
  enableClipboard = true,
}: JsonViewerProps) {
  return (
    <div className="border border-gray-300 rounded-md overflow-auto" style={{ maxHeight, height }}>
      <JsonView
        value={value}
        collapsed={collapsed}
        displayDataTypes={displayDataTypes}
        displayObjectSize={displayObjectSize}
        enableClipboard={enableClipboard}
        style={{ padding: '16px', backgroundColor: '#fff' }}
      />
    </div>
  );
}

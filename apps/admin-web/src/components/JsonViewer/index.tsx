import JsonView from '@uiw/react-json-view';

interface JsonViewerProps {
  value?: any;
  height?: string;
  maxHeight?: string;
}

export function JsonViewer({ value, height = '400px', maxHeight = '800px' }: JsonViewerProps) {
  return (
    <div className="border border-gray-300 rounded-md overflow-auto" style={{ maxHeight, height }}>
      <JsonView
        value={value}
        collapsed={false}
        enableClipboard={true}
        style={{ padding: '16px', backgroundColor: '#fff' }}
      />
    </div>
  );
}

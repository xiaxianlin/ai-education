import { json } from '@codemirror/lang-json';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';

interface JsonEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
  maxHeight?: string;
  disabled?: boolean;
}

export function JsonEditor({
  value,
  onChange,
  height = '400px',
  maxHeight = '800px',
  disabled = false,
}: JsonEditorProps) {
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden" style={{ maxHeight }}>
      <CodeMirror
        width="100%"
        readOnly={disabled}
        value={value || ''}
        onChange={onChange}
        height={height}
        extensions={[json(), EditorView.lineWrapping]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
        }}
      />
    </div>
  );
}

import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
  maxHeight?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  height = '400px',
  maxHeight = '800px',
}: MarkdownEditorProps) {
  const heightNum = typeof height === 'string' ? parseInt(height) : height;
  
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden" style={{ maxHeight }}>
      <MDEditor
        value={value || ''}
        onChange={(val) => onChange?.(val || '')}
        height={heightNum}
        preview="edit"
        data-color-mode="light"
      />
    </div>
  );
}

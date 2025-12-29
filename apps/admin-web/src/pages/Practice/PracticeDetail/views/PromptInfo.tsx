interface PromptInfoProps {
  prompt?: string;
}

export function PromptInfo({ prompt }: PromptInfoProps) {
  if (!prompt) {
    return <div style={{ color: '#999' }}>-</div>;
  }

  return (
    <pre
      style={{
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        margin: 0,
        padding: 16,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        maxHeight: '500px',
        overflow: 'auto',
      }}
    >
      {prompt}
    </pre>
  );
}


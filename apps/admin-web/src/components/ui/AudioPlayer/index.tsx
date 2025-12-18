import React from 'react';
import { Space } from 'antd';

interface AudioPlayerProps {
  src: string;
  resourceContent?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, resourceContent }) => {
  return (
    <div style={{ padding: '20px 0' }}>
      <audio controls style={{ width: '100%', maxWidth: '600px' }}>
        <source src={src} type="audio/mpeg" />
        您的浏览器不支持音频播放。
      </audio>
      <div style={{ marginTop: '10px', color: 'var(--muted-foreground)', fontSize: '12px' }}>
        <a href={src} target="_blank" rel="noopener noreferrer">
          下载音频文件
        </a>
      </div>
      {resourceContent && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            background: 'var(--muted)',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          <strong>录音文本：</strong>{resourceContent}
        </div>
      )}
    </div>
  );
};


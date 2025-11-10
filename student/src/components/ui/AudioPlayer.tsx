import React from 'react';

interface AudioPlayerProps {
  src: string;
  resourceContent?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, resourceContent }) => {
  return (
    <div className="py-5">
      <audio controls className="w-full max-w-2xl rounded-lg">
        <source src={src} type="audio/mpeg" />
        您的浏览器不支持音频播放。
      </audio>
      <div className="mt-2 text-xs text-gray-500">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          下载音频文件
        </a>
      </div>
      {resourceContent && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
          <strong>录音文本：</strong>
          {resourceContent}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;


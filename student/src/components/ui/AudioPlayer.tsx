import React from "react";

interface AudioPlayerProps {
  src: string;
  resourceContent?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  return (
    <div className="py-2 w-full">
      <audio controls style={{ width: "100%", maxWidth: "600px" }}>
        <source src={src} type="audio/mpeg" />
        您的浏览器不支持音频播放。
      </audio>
    </div>
  );
};

export default AudioPlayer;

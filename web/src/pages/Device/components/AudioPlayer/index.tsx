import React, { useEffect, useRef, useState } from 'react';
import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

interface AudioPlayerProps {
  url: string;
}

export function AudioPlayer({ url }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.load();
      setIsPlaying(false);
    } else {
      audioRef.current = new Audio(url);
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current?.remove();
    };
  }, [url]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  return !isPlaying ? (
    <PlayCircleOutlined onClick={handlePlay} style={{ fontSize: 32, color: 'rgba(0,0,0,0.5)' }} />
  ) : (
    <PauseCircleOutlined onClick={handlePause} style={{ fontSize: 32, color: '#d9d9d9' }} />
  );
}

export default AudioPlayer;

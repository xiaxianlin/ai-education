import React, { useState, useRef } from 'react';
import { View, Pressable, Text } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Play, Pause } from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  resourceContent?: string;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioRecorderPlayer.pausePlayer();
        setIsPlaying(false);
      } else {
        const msg = await audioRecorderPlayer.startPlayer(src);
        audioRecorderPlayer.addPlayBackListener((e) => {
          setCurrentPosition(e.currentPosition);
          setDuration(e.duration);
          if (e.currentPosition === e.duration) {
            setIsPlaying(false);
            audioRecorderPlayer.stopPlayer();
          }
        });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  return (
    <View className="py-2 w-full">
      <Pressable
        onPress={handlePlayPause}
        className="flex-row items-center space-x-2 rounded-lg bg-muted p-3"
      >
        {isPlaying ? (
          <Pause size={20} color="#007AFF" />
        ) : (
          <Play size={20} color="#007AFF" />
        )}
        <Text className="text-sm text-foreground">
          {isPlaying ? '暂停' : '播放'}
        </Text>
      </Pressable>
    </View>
  );
}


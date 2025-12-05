import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Mic, Square, Loader2 } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface AudioRecorderProps {
  onRecordingComplete: (audioPath: string) => void;
  disabled?: boolean;
  maxDuration?: number; // 最大录音时长（秒），默认 60 秒
}

export function AudioRecorder({
  onRecordingComplete,
  disabled = false,
  maxDuration = 60,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPathRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  const requestPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.MICROPHONE
        : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const result = await request(permission);
    return result === RESULTS.GRANTED;
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('麦克风权限被拒绝');
      }

      const path = Platform.select({
        ios: 'audio.m4a',
        android: 'sdcard/audio.mp4',
      });

      const result = await audioRecorderPlayer.startRecorder(path!);
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordingTime(Math.floor(e.currentPosition / 1000));
        if (e.currentPosition / 1000 >= maxDuration) {
          stopRecording();
        }
      });

      audioPathRef.current = result;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (audioPathRef.current) {
        setIsProcessing(true);
        const result = await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
        setIsRecording(false);
        setIsProcessing(false);

        if (result) {
          onRecordingComplete(result);
        }
        audioPathRef.current = null;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="w-full">
      {!isRecording ? (
        <Button
          onPress={startRecording}
          disabled={disabled || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="mr-2" />
              处理中...
            </>
          ) : (
            <>
              <Mic size={16} className="mr-2" />
              开始录音
            </>
          )}
        </Button>
      ) : (
        <View className="flex-row items-center justify-between rounded-lg border border-primary bg-primary/10 p-4">
          <View className="flex-row items-center space-x-3">
            <View className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
            <Text className="text-lg font-mono text-foreground">
              {formatTime(recordingTime)}
            </Text>
          </View>
          <Button variant="destructive" onPress={stopRecording} size="sm">
            <Square size={16} className="mr-2" />
            停止
          </Button>
        </View>
      )}
    </View>
  );
}


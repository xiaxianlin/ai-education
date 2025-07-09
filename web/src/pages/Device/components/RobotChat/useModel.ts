import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';
import { Recorder, StreamPlayer } from '@/utils/audio';
import { isString } from 'lodash-es';
export interface RobotChatProps {
  robot: Robot;
}
export const useModel = ({ robot }: RobotChatProps) => {
  const [recorder, setRecorder] = useState<Recorder>();

  const [playing, setPlaying] = useState(false);
  const [receiving, setRevceiving] = useState(false);
  const [connected, setConnected] = useState(false);

  const socket = useRef<WebSocket>();
  const player = useRef<StreamPlayer>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sendText = (cmd: string) => {
    socket.current?.send(JSON.stringify({ cmd }));
  };

  const handleMessage = (data: any) => {
    console.log('receive', data);
    if (isString(data)) {
      const res = JSON.parse(data);
      if (res.cmd === 'start') {
        setRevceiving(true);
        player.current = new StreamPlayer(canvasRef.current);
        player.current.onend = () => setPlaying(false);
        setPlaying(true);
      }
      if (res.cmd === 'end') {
        setRevceiving(false);
      }
      if (res.cmd === 'error') {
        message.error(res.message);
      }
    } else {
      player.current?.receive(data);
    }
  };

  const startRecord = () => {
    const recorder = new Recorder(canvasRef.current);
    recorder.onstream = (e) => socket.current?.send(e.data);
    recorder.start();
    setRecorder(recorder);
    sendText('start');
  };

  const stopRecord = () => {
    recorder?.stop();
    setRecorder(undefined);
    sendText('end');
  };

  useEffect(() => {
    const ws = new WebSocket(`${process.env.WS_API}/robot/connect/${robot.did}`);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      message.success('服务已连接');
      ws.send(JSON.stringify({ cmd: 'init', type: 'webm' }));
      setConnected(true);
    };
    ws.onclose = () => {
      message.warning('服务已断开');
      setConnected(false);
    };
    ws.onmessage = (e) => handleMessage(e.data);
    socket.current = ws;
    return () => ws.close();
  }, []);

  return {
    refs: { canvasRef },
    state: { recorder, connected, playing, receiving },
    startRecord,
    stopRecord,
  };
};

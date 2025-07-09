import { api } from '@/utils/api';
import { useRequest } from 'ahooks';
import { Flex, Select } from 'antd';
import { useMemo } from 'react';
import AudioPlayer from '../AudioPlayer';

interface VoiceSelectProps {
  id?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function VoiceSelect(props: VoiceSelectProps) {
  const { data } = useRequest(() => api.get<RobotVoice[]>('/user/robot/voices'));

  const options = useMemo(() => {
    return data?.data.map((i) => ({ value: i.value, label: i.name }));
  }, [data?.data]);

  const url = useMemo(() => {
    const voice = data?.data.find((i) => i.value === props.value);
    return voice?.url;
  }, [data?.data, props.value]);

  return (
    <Flex gap={16}>
      <Select options={options} {...props} />
      {url && <AudioPlayer url={url} />}
    </Flex>
  );
}

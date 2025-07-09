import { api } from '@/utils/api';
import { formatMarkdown } from '@/utils/format';
import { useRequest } from 'ahooks';
import { Form, message } from 'antd';
import { useEffect, useState } from 'react';
import { createContainer } from 'unstated-next';
const useContainer = () => {
  const [id, setId] = useState<string>();
  const [file, setFile] = useState<File>();
  const [visible, setVisible] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [form] = Form.useForm<ProfileFormModel>();

  const { data: profile, refresh } = useRequest(async () => {
    const res = await api.get<Profile>('/education/profile');
    return res.ok ? res.data : undefined;
  });

  const { runAsync: save, loading } = useRequest(
    (values: ProfileFormModel) => {
      return api.post(`/education/profile`, values);
    },
    {
      manual: true,
      onSuccess: (res) => {
        message.success(res.ok ? '信息保存成功' : res.message);
        refresh();
      },
    },
  );

  const reset = () => {
    setFile(undefined);
    setThinking(false);
    setAnswering(false);
  };

  const { runAsync: upload } = useRequest(
    async (file: File) => {
      const data = new FormData();
      data.append('file', file);
      data.append('subject', '数学');
      return await api.upload<string>('/education/question/upload', data);
    },
    {
      manual: true,
      onBefore: () => {
        setUploading(true);
        setProcessing(true);
        reset();
      },
      onSuccess: (res) => {
        setId(res.ok ? res.data : undefined);
        if (!res.ok) {
          throw res.message;
        }
      },
      onError: () => {
        setUploading(false);
        setProcessing(false);
        reset();
      },
    },
  );

  const handleSelectFile = (file: File) => {
    if (!profile) {
      message.warning('请先设置信息');
      return false;
    }
    setFile(file);
    upload(file);
    setId(undefined);
    return false;
  };

  const show = () => {
    if (profile) {
      form.setFieldsValue(profile);
    }
    setVisible(true);
  };

  const hide = () => {
    form.resetFields();
    setVisible(false);
  };

  const submit = async () => {
    if (!(await form.validateFields())) return;
    const values: ProfileFormModel = form.getFieldsValue();
    await save(values);
    hide();
  };

  useEffect(() => {
    if (!id) return;
    const panelEle = document.getElementById('ai-panel');
    const answerEle = document.getElementById('ai-answer');
    const thoughtEle = document.getElementById('ai-reasoning');
    const token = localStorage.getItem('token') || '';
    const ws = new WebSocket(`${process.env.WS_API}/education/question/resolve?id=${id}&token=${token}`);
    let answer = '';
    let thought = '';
    let isStart = false;
    let isAnswer = false;
    let isThought = false;
    ws.onmessage = (e) => {
      if (!isStart) {
        setUploading(false);
        isStart = true;
      }
      const data = JSON.parse(e.data);
      if (data?.reasoning) {
        if (!isThought) {
          setThinking(true);
          isThought = true;
        }
        thought += data.reasoning || '';
        if (thoughtEle) {
          thoughtEle.innerHTML = formatMarkdown(thought);
        }
      } else if (data?.answer) {
        if (!isAnswer) {
          setAnswering(true);
          isAnswer = true;
        }
        answer += data.answer || '';
        if (answerEle) {
          answerEle.innerHTML = formatMarkdown(answer);
        }
      } else if (data?.usage) {
        ws.close();
      }
      setTimeout(() => {
        if (panelEle) {
          panelEle.scrollTop = panelEle.scrollHeight;
        }
      }, 10);
    };
    ws.onclose = () => {
      setProcessing(false);
      setUploading(false);
    };
    ws.onerror = (e) => {
      console.error('WebSocket error:', e);
    };
  }, [id]);

  return {
    file,
    form,
    visible,
    profile,
    loading,
    thinking,
    answering,
    uploading,
    processing,
    show,
    hide,
    submit,
    setVisible,
    handleSelectFile,
  };
};

export const QuestionResolveModel = createContainer(useContainer);
export const useQuestionResolveModel = QuestionResolveModel.useContainer;

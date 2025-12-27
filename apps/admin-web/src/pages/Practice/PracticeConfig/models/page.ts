import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { PracticeApi } from '../../api';
import { useBoolean, useRequest } from 'ahooks';
import { useSearchParams } from 'react-router-dom';
import { ProForm } from '@ant-design/pro-components';

const useContainer = () => {
  const [searchParams] = useSearchParams();
  const practiceId = Number(searchParams.get('id') || 0);
  const [parameter, setParameter] = useState<PracticeParameter>();
  const [parameters, setParameters] = useState<PracticeParameter[]>([]);
  const [visible, { setTrue, setFalse }] = useBoolean(false);
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string>('');

  const [form] = ProForm.useForm<PracticeParameter>();

  const { data: practice, loading } = useRequest(() => PracticeApi.getPractice(practiceId), {
    ready: !!practiceId,
    onSuccess: (res) => {
      setParameters(res.parameters || []);
      setJsonText(JSON.stringify(res.parameters || [], null, 2));
    },
  });

  const { run: submit } = useRequest(() => PracticeApi.savePracticeParameters(practiceId, parameters), {
    manual: true,
  });

  const removeParameter = (key: string) => {
    setParameters(parameters.filter((param) => param.key !== key));
    setJsonText(JSON.stringify(parameters, null, 2));
  };

  const saveParameter = (param: PracticeParameter) => {
    const nextParameters = parameter
      ? parameters.map((p) => (p.key === parameter.key ? param : p))
      : [...parameters, param];
    setParameters(nextParameters);
    setJsonText(JSON.stringify(nextParameters, null, 2));
  };

  const showDrawerForm = (recored?: PracticeParameter) => {
    setTrue();
    setParameter(recored);
    if (recored) {
      form.setFieldsValue(recored);
    }
  };

  const hideDrawerForm = () => {
    setFalse();
    setParameter(undefined);
    form.resetFields();
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonText(value);

    // 实时验证 JSON 格式
    try {
      const nextValue = JSON.parse(value);
      setParameters(nextValue);
      setJsonError('');
    } catch (error: any) {
      setJsonError(error.message);
    }
  };

  return {
    form,
    loading,
    visible,
    practice,
    parameter,
    parameters,
    jsonText,
    jsonError,
    setParameters,
    setJsonText,
    setJsonError,
    submit,
    saveParameter,
    removeParameter,
    showDrawerForm,
    hideDrawerForm,
    handleJsonChange,
  };
};

export const PracticeConfigModel = createContainer(useContainer);
export const usePracticeConfigModel = PracticeConfigModel.useContainer;

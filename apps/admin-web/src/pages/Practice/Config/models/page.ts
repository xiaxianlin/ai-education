import { useState } from 'react';
import { createContainer } from 'unstated-next';
import { adminApi } from '@/lib/api';
import { useBoolean, useRequest } from 'ahooks';
import { useSearchParams } from 'react-router-dom';
import { ProForm } from '@ant-design/pro-components';

const useContainer = () => {
  const [searchParams] = useSearchParams();
  const practiceId = Number(searchParams.get('id') || 0);
  const [parameter, setParameter] = useState<PracticeParameter>();
  const [parameters, setParameters] = useState<PracticeParameter[]>([]);
  const [visible, { setTrue, setFalse }] = useBoolean(false);

  const [form] = ProForm.useForm<PracticeParameter>();

  const { data: practice, loading } = useRequest(() => adminApi.getPractice(practiceId), {
    ready: !!practiceId,
    onSuccess: (res) => setParameters(res.parameters || []),
  });

  const { run: submit } = useRequest(() => adminApi.savePracticeParameters(practiceId, parameters), {
    manual: true,
  });

  const removeParameter = (key: string) => {
    setParameters(parameters.filter((param) => param.key !== key));
  };

  const saveParameter = (param: PracticeParameter) => {
    if (parameter) {
      setParameters(parameters.map((p) => (p.key === parameter.key ? param : p)));
    } else {
      setParameters([...parameters, param]);
    }
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

  return {
    form,
    loading,
    visible,
    practice,
    parameter,
    parameters,
    submit,
    saveParameter,
    removeParameter,
    showDrawerForm,
    hideDrawerForm,
  };
};

export const PracticeConfigModel = createContainer(useContainer);
export const usePracticeConfigModel = PracticeConfigModel.useContainer;

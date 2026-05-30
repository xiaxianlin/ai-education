import { toast } from '@/components/ui/toast';
import { useInitialStateModel } from '@/models/initialState';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { StudentApi } from '../../api';

const useContainer = () => {
  const { id: studentId } = useParams<{ id: string }>();
  const { subject, grade } = useInitialStateModel();
  const actionRef = useRef<{ reload: () => void }>();
  const [item, setItem] = useState<StudentTextbookConfig>();
  const [visible, setVisible] = useState(false);

  const showForm = (config?: StudentTextbookConfig) => {
    setItem(config);
    setVisible(true);
  };

  const onCancel = () => {
    setItem(undefined);
    setVisible(false);
  };

  const handleSubmit = async (values: SaveStudentTextbookConfigRequest) => {
    if (!studentId) throw new Error('学生ID不存在');
    if (item) {
      await StudentApi.updateStudentTextbookConfig(studentId, item.id, values);
      toast.success('更新成功');
    } else {
      await StudentApi.createStudentTextbookConfig(studentId, values);
      toast.success('新增成功');
    }
    setItem(undefined);
    setVisible(false);
    actionRef.current?.reload();
  };

  useEffect(() => {
    actionRef.current?.reload();
  }, [subject, grade]);

  return {
    studentId,
    subject,
    grade,
    formProps: {
      visible,
      item,
      showForm,
      onCancel,
      handleSubmit,
    },
    actionRef,
  };
};

export const TextbookConfigModel = createContainer(useContainer);
export const useTextbookConfigModel = TextbookConfigModel.useContainer;

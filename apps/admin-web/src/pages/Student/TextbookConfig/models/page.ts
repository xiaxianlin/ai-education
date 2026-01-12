import { useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { ActionType } from '@ant-design/pro-components';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createContainer } from 'unstated-next';
import { StudentApi } from '../../api';

const useContainer = () => {
  const { id: studentId } = useParams<{ id: string }>();
  const { subject, grade } = useInitialStateModel();
  const actionRef = useRef<ActionType>();

  const formProps = useSimpleForm<SaveStudentTextbookConfigRequest, StudentTextbookConfig>({
    service: async (values, item) => {
      if (!studentId) throw new Error('学生ID不存在');
      if (item) {
        await StudentApi.updateStudentTextbookConfig(studentId, item.id, values);
      } else {
        await StudentApi.createStudentTextbookConfig(studentId, values);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  useEffect(() => {
    actionRef.current?.reload();
  }, [subject, grade]);

  return { studentId, subject, grade, formProps, actionRef };
};

export const TextbookConfigModel = createContainer(useContainer);
export const useTextbookConfigModel = TextbookConfigModel.useContainer;

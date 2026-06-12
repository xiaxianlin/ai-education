import { useSimpleForm } from '@/hooks';
import type { TableActionRef } from '@/components/ui';
import { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { TextbookApi } from '../../api';

const useContainer = () => {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState<number | undefined>();
  const [teacherId, setTeacherId] = useState('');
  const [version, setVersion] = useState('');
  const [semester, setSemester] = useState('');

  const actionRef = useRef<TableActionRef>();
  const formProps = useSimpleForm<SaveTextbookRequest, Textbook>({
    service: async (values, item) => {
      if (item) {
        await TextbookApi.updateTextbook(item.id, values);
      } else {
        await TextbookApi.createTextbook(values);
      }
    },
    onSubmit: () => actionRef.current?.reload(),
  });

  useEffect(() => {
    actionRef.current?.reload();
  }, [subject, grade, teacherId, version, semester]);

  return {
    subject,
    grade,
    teacherId,
    version,
    semester,
    setSubject,
    setGrade,
    setTeacherId,
    setVersion,
    setSemester,
    actionRef,
    formProps,
  };
};

export const TextbookListModel = createContainer(useContainer);
export const useTextbookListModel = TextbookListModel.useContainer;

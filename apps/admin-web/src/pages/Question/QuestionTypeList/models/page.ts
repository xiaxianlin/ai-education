import { useDelete, useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { AbilityApi } from '@/pages/Ability/api';
import { PracticeType } from '@ai-education/shared-web';
import { ActionType } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { subject, grade } = useInitialStateModel();
  const [type, setType] = useState<PracticeType>(PracticeType.UNIT_PRACTICE);

  const unitActionRef = useRef<ActionType>();
  const abilityActionRef = useRef<ActionType>();

  const refresh = () => {
    if (type === PracticeType.UNIT_PRACTICE) {
      unitActionRef.current?.reload?.();
    } else {
      abilityActionRef.current?.reload?.();
    }
  };

  const { data: abilities } = useRequest(() => AbilityApi.searchAbilities({ subject, grade }), {
    refreshDeps: [subject, grade],
  });
  const abilityOptions = useMemo(
    () => abilities?.map((ability) => ({ label: ability.name, value: ability.code })),
    [abilities],
  );

  const formProps = useSimpleForm<QuestionTypeSaveRequest, QuestionType>({
    service: async (values, item) => {
      if (item) {
        values.id = item.id;
      }
      values.category = type;
      values.subject = subject;
      await QuestionApi.saveQuestionType(values);
    },
    onSubmit: refresh,
  });

  // 删除
  const { handleDelete } = useDelete(QuestionApi.deleteQuestionType, {
    onSuccess: refresh,
  });

  useEffect(() => {
    abilityActionRef.current?.reload?.();
  }, [subject, grade]);

  return {
    type,
    grade,
    subject,
    abilityOptions,
    unitActionRef,
    abilityActionRef,
    ...formProps,
    setType,
    handleDelete,
  };
};

export const QuestionTypeModel = createContainer(useContainer);
export const useQuestionTypeModel = QuestionTypeModel.useContainer;

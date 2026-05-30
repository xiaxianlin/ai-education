import { useDelete, useSimpleForm } from '@/hooks';
import { useInitialStateModel } from '@/models/initialState';
import { AbilityApi } from '@/pages/Ability/api';
import { PracticeType } from '@ai-education/shared-web';
import { useRequest } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';
import { createContainer } from 'unstated-next';
import { QuestionApi } from '../../api';

const useContainer = () => {
  const { subject, grade } = useInitialStateModel();
  const [type, setType] = useState<PracticeType>(PracticeType.UNIT_PRACTICE);
  const [unitRefreshKey, setUnitRefreshKey] = useState(0);
  const [abilityRefreshKey, setAbilityRefreshKey] = useState(0);

  const refresh = () => {
    if (type === PracticeType.UNIT_PRACTICE) {
      setUnitRefreshKey((key) => key + 1);
    } else {
      setAbilityRefreshKey((key) => key + 1);
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
      await QuestionApi.saveQuestionType({
        ...values,
        id: item?.id,
        category: type,
        subject,
      });
    },
    onSubmit: refresh,
  });

  const { handleDelete } = useDelete(QuestionApi.deleteQuestionType, {
    onSuccess: refresh,
  });

  useEffect(() => {
    setAbilityRefreshKey((key) => key + 1);
  }, [subject, grade]);

  return {
    type,
    grade,
    subject,
    abilityOptions,
    unitRefreshKey,
    abilityRefreshKey,
    ...formProps,
    setType,
    handleDelete,
  };
};

export const QuestionTypeModel = createContainer(useContainer);
export const useQuestionTypeModel = QuestionTypeModel.useContainer;

import { useProfileModel } from "@/common/models/ProfileModel";
import { studentApi } from "@/lib/api";
import { useRequest } from "ahooks";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

const useContainer = () => {
  const { profile } = useProfileModel();
  const { grade, subject } = profile || {};

  const [atomicsBySubject, setAtomicsBySubject] = useState<Record<string, AbilityAtomic[]>>({});
  const [loading, setLoading] = useState(false);

  // 只获取当前设置学科的原子能力列表
  useEffect(() => {
    // 严格验证：grade 必须是有效的正整数（> 0），subject 必须是有效的非空字符串
    const isValidGrade = typeof grade === "number" && grade > 0 && Number.isInteger(grade);
    const isValidSubject = typeof subject === "string" && subject.trim().length > 0;

    if (!isValidGrade || !isValidSubject) {
      setAtomicsBySubject({});
      setLoading(false);
      return;
    }

    setLoading(true);
    studentApi
      .getAbilityAtomics(subject, grade)
      .then((atomics) => {
        if (atomics.length > 0) {
          setAtomicsBySubject({ [subject]: atomics });
        } else {
          setAtomicsBySubject({});
        }
        setLoading(false);
      })
      .catch(() => {
        setAtomicsBySubject({});
        setLoading(false);
      });
  }, [subject, grade]);

  const { loading: creating, run: createPractice } = useRequest(
    (params: { abilityCodes: string[]; subject: string; grade: number; textbookId: number }) =>
      studentApi.createPractice({
        type: "ability_practice",
        textbook_id: params.textbookId,
        ability_codes: params.abilityCodes,
        subject: params.subject,
        grade: params.grade,
      }),
    {
      manual: true,
    }
  );

  // 只返回当前设置的学科
  const currentSubject = subject || null;
  const displaySubjects = currentSubject ? [currentSubject] : [];

  return {
    loading,
    creating,
    atomicsBySubject,
    subjects: displaySubjects,
    createPractice,
  };
};

export const PageModel = createContainer(useContainer);
export const usePageModel = PageModel.useContainer;

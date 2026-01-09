/**
 * useAbilityPractice Hook
 * 用于查询、创建和轮询指定能力代码的练习
 */
import { useProfileModel } from "@/common/models/ProfileModel";
import { studentApi } from "@/lib/api";
import { PracticeGenerateStatus } from "@ai-education/shared-web";
import { useRequest } from "ahooks";
import { useMemo } from "react";

export function useAbilityPractice(abilityCode: string) {
  const { profile, activeTextbook } = useProfileModel();
  const { grade, subject } = profile || {};

  // 查询练习
  const {
    data: practice,
    loading,
    refresh,
  } = useRequest(() => studentApi.getAbilityPracticeByCode(abilityCode), {
    ready: !!abilityCode,
    refreshDeps: [abilityCode],
    onSuccess: (res) => {
      if (res?.generate_status === PracticeGenerateStatus.GENERATING) {
        setTimeout(() => refresh(), 1000);
      }
    },
  });

  // 检查 activeTextbook 是否匹配（用于创建练习）
  const matchedTextbook = useMemo(() => {
    if (!subject || !grade || !activeTextbook) return null;
    // 检查 activeTextbook 是否匹配当前的 subject 和 grade
    if (activeTextbook.subject === subject && activeTextbook.grade === grade) {
      return activeTextbook;
    }
    return null;
  }, [activeTextbook, subject, grade]);

  // 创建练习
  const { loading: creating, run: createPractice } = useRequest(
    (params: { abilityCode: string; subject: string; grade: number; textbookId: number }) =>
      studentApi.createPractice({
        type: "ability_practice",
        textbook_id: params.textbookId,
        ability_code: params.abilityCode,
        subject: params.subject,
        grade: params.grade,
      }),
    {
      manual: true,
      onSuccess: refresh,
    }
  );

  // 创建练习的包装函数
  const handleCreatePractice = () => {
    if (!matchedTextbook || !grade || !subject) return;

    createPractice({
      abilityCode: abilityCode,
      subject: subject,
      grade: grade,
      textbookId: matchedTextbook.id,
    });
  };

  return {
    practice: practice || null,
    loading,
    creating,
    createPractice: handleCreatePractice,
    refresh,
    canCreate: !!matchedTextbook && !!grade && !!subject,
  };
}

/** 根据年级获取学段 */
export const gradeToStage = (grade: number) => {
  if (grade <= 3) return "primary_low";
  if (grade <= 6) return "primary_high";
  if (grade <= 9) return "junior";
  return "senior";
};

/** 判断是否为复合题 */
export const isCompositeQuestion = (question: Question): boolean => {
  return (question.stem.sub_questions?.length || 0) > 0;
};

/** 获取题目总分 */
export const getQuestionTotalScore = (question: Question): number => {
  if (isCompositeQuestion(question)) {
    // 复合题：累加子题分数
    return (
      question.stem.sub_questions?.reduce((sum: number, sub: any) => sum + (sub.answer.scoring?.full_score || 0), 0) ||
      0
    );
  }
  return question.answer.scoring?.full_score || 10;
};

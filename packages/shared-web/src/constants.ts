export const PRACTICE_TYPE_MAP: Record<PracticeType, string> = {
  system: "系统练习",
  custom: "自定义练习",
};

export const PRACTICE_TYPE_OPTIONS = Object.entries(PRACTICE_TYPE_MAP).map(([value, label]) => ({
  label,
  value,
}));

export const PRACTICE_PARAMETER_VALUE_TYPE_MAP: Record<PracticeParameterValueType, string> = {
  string: "字符串",
  number: "数字",
  object: "对象",
  array: "数组",
};

export const PRACTICE_PARAMETER_VALUE_TYPE_OPTIONS = Object.entries(PRACTICE_PARAMETER_VALUE_TYPE_MAP).map(
  ([value, label]) => ({
    label,
    value,
  })
);

export const PRACTICE_PARAMETER_TYPE_MAP: Record<PracticeParameterType, string> = {
  system: "内置参数",
  input: "输入参数",
};

export const PRACTICE_PARAMETER_TYPE_OPTIONS = Object.entries(PRACTICE_PARAMETER_TYPE_MAP).map(([value, label]) => ({
  label,
  value,
}));

export const PRACTICE_SESSION_STATUS_MAP: Record<PracticeSessionStatus, string> = {
  0: "未开始",
  1: "进行中",
  2: "已完成",
};

export const PRACTICE_SESSION_STATUS_OPTIONS = Object.entries(PRACTICE_SESSION_STATUS_MAP).map(([value, label]) => ({
  label,
  value,
}));

export const PRACTICE_GENERATE_STATUS_MAP: Record<PracticeGenerateStatus, string> = {
  0: "生成失败",
  1: "生成中",
  2: "生成成功",
};

export const PRACTICE_GENERATE_STATUS_OPTIONS = Object.entries(PRACTICE_GENERATE_STATUS_MAP).map(([value, label]) => ({
  label,
  value,
}));

export const GRADES: Record<number, string> = {
  1: "一年级",
  2: "二年级",
  3: "三年级",
  4: "四年级",
  5: "五年级",
  6: "六年级",
  7: "七年级",
  8: "八年级",
  9: "九年级",
  10: "高一",
  11: "高二",
  12: "高三",
};

export const GRADE_OPTIONS = Object.entries(GRADES).map(([value, label]) => ({
  label,
  value,
}));

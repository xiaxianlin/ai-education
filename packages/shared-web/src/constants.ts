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

export const parseParameter = (paramemeter: PracticeParameter) => {
  if (['array', 'object'].includes(paramemeter.value_type) && paramemeter.value) {
    return {
      ...paramemeter,
      value: JSON.stringify(paramemeter.value),
    };
  }
  return paramemeter;
};

export const toParameter = (paramemeter: PracticeParameter) => {
  if (
    ['array', 'object'].includes(paramemeter.value_type) &&
    paramemeter.value &&
    typeof paramemeter.value === 'string'
  ) {
    return {
      ...paramemeter,
      value: JSON.parse(paramemeter.value),
    };
  }
  return paramemeter;
};

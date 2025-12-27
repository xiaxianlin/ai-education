export const PRACTICE_PARAMETER_VALUE_TYPE_MAP: Record<PracticeParameterValueType, { color: string; label: string }> = {
  string: { color: 'default', label: '字符串' },
  number: { color: 'orange', label: '数字' },
  object: { color: 'purple', label: '对象' },
  array: { color: 'cyan', label: '数组' },
};

export const PRACTICE_PARAMETER_VALUE_TYPE_OPTIONS = [
  { label: '字符串', value: 'string' },
  { label: '数字', value: 'number' },
  { label: '对象', value: 'object' },
  { label: '数组', value: 'array' },
];

export const PRACTICE_PARAMETER_TYPE_OPTIONS = [
  { label: '内置参数', value: 'system' },
  { label: '输入参数', value: 'input' },
];

export const formatValue = (value: any, valueType: string): string => {
  if (!value) return '-';

  // For object or array types, ensure we display as JSON string
  if (valueType === 'object' || valueType === 'array') {
    try {
      // If value is already a string, try to parse and re-stringify for consistency
      if (typeof value === 'string') {
        const parsed = JSON.parse(value);
        return JSON.stringify(parsed);
      }
      // If value is an object/array, stringify it
      return JSON.stringify(value);
    } catch (e) {
      // If parsing fails but it's a string, return as-is
      if (typeof value === 'string') {
        return value;
      }
      // Last resort: try to stringify whatever it is
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }
  }

  // For other types, convert to string
  return String(value);
};

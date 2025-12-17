/**
 * 模板解析工具
 * 用于从模板内容中提取参数
 */

export interface TemplateParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  description?: string;
}

/**
 * 从模板内容中提取参数
 * @param templateContent 模板内容
 * @returns 提取的参数列表
 */
export function extractTemplateParameters(templateContent: string): TemplateParameter[] {
  if (!templateContent) {
    return [];
  }

  // 使用正则表达式匹配 {param} 格式的参数
  const paramRegex = /\{([^}]+)\}/g;
  const matches = templateContent.match(paramRegex);

  if (!matches) {
    return [];
  }

  // 提取参数名并去重
  const paramNames = Array.from(
    new Set(
      matches.map(match => match.slice(1, -1).trim()).filter(name => name.length > 0)
    )
  );

  // 转换为参数对象
  return paramNames.map(name => ({
    name,
    type: inferParameterType(name),
    required: true, // 默认都为必填
    description: `参数 ${name}`,
  }));
}

/**
 * 推断参数类型
 * @param paramName 参数名
 * @returns 推断的参数类型
 */
function inferParameterType(paramName: string): TemplateParameter['type'] {
  const name = paramName.toLowerCase();

  // 根据参数名推断类型
  if (name.includes('count') || name.includes('num') || name.includes('number') || name.includes('amount')) {
    return 'number';
  }

  if (name.includes('is') || name.includes('has') || name.includes('can') || name.includes('should')) {
    return 'boolean';
  }

  if (name.includes('config') || name.includes('setting') || name.includes('options') || name.includes('data')) {
    return 'object';
  }

  // 默认为字符串类型
  return 'string';
}

/**
 * 验证参数值
 * @param parameter 参数定义
 * @param value 参数值
 * @returns 验证结果
 */
export function validateParameter(parameter: TemplateParameter, value: any): { valid: boolean; error?: string } {
  // 检查必填
  if (parameter.required && (value === undefined || value === null || value === '')) {
    return { valid: false, error: `${parameter.name} 是必填项` };
  }

  // 类型验证
  switch (parameter.type) {
    case 'number':
      if (value !== undefined && value !== null && value !== '' && isNaN(Number(value))) {
        return { valid: false, error: `${parameter.name} 必须是数字` };
      }
      break;

    case 'boolean':
      if (value !== undefined && value !== null && value !== '' && typeof value !== 'boolean') {
        const lowerValue = String(value).toLowerCase();
        if (!['true', 'false', '1', '0'].includes(lowerValue)) {
          return { valid: false, error: `${parameter.name} 必须是布尔值` };
        }
      }
      break;

    case 'object':
      if (value !== undefined && value !== null && value !== '' && typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch {
          return { valid: false, error: `${parameter.name} 必须是有效的 JSON 对象` };
        }
      }
      break;

    default:
      // string 类型不需要特殊验证
      break;
  }

  return { valid: true };
}

/**
 * 获取参数的默认值
 * @param parameter 参数定义
 * @returns 默认值
 */
export function getParameterValue(parameter: TemplateParameter): any {
  switch (parameter.type) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'object':
      return {};
    default:
      return '';
  }
}

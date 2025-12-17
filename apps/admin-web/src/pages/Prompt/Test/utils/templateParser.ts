/**
 * 模板解析工具
 * 用于从模板内容中提取参数
 */

export interface TemplateParameter {
  name: string;
  required: boolean;
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
    new Set(matches.map((match) => match.slice(1, -1).trim()).filter((name) => name.length > 0)),
  );

  // 转换为参数对象
  return paramNames.map((name) => ({ name, required: true }));
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

  return { valid: true };
}

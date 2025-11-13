/**
 * 资源 URL 工具函数
 * 用于处理问题资源的 URL，自动拼接 OSS base_url
 */

const OSS_BASE_URL = 'https://xxl-ai-helper.oss-cn-hangzhou.aliyuncs.com';

/**
 * 获取完整的资源 URL
 * @param resourcePath 资源路径（可能是相对路径或完整 URL）
 * @returns 完整的资源 URL
 */
export function getResourceUrl(resourcePath: string | null | undefined): string | null {
  if (!resourcePath) {
    return null;
  }

  // 如果已经是完整的 URL，直接返回
  if (resourcePath.startsWith('http://') || resourcePath.startsWith('https://')) {
    return resourcePath;
  }

  // 如果是相对路径，拼接 base_url
  return `${OSS_BASE_URL}/${resourcePath}`;
}


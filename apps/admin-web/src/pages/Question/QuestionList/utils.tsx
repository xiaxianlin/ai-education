/**
 * 素材相关的映射常量和功能函数
 */

export const RESOURCE_STATUS_CONFIG = {
  none: { label: '-', color: 'default' },
  not_generated: { label: '未生成', color: 'red' },
  partial: { label: '生成不足', color: 'orange' },
  complete: { label: '已生成', color: 'green' },
} as const;

export type ResourceStatus = keyof typeof RESOURCE_STATUS_CONFIG;

/**
 * 判断是否需要素材
 */
export function hasResources(question: Question): boolean {
  return !!(question.resources && question.resources.length > 0);
}

/**
 * 获取素材状态
 */
export function getResourceStatus(question: Question): ResourceStatus {
  // 如果不需要素材，返回 'none'
  if (!hasResources(question)) {
    return 'none';
  }

  const resources = question.resources!;
  // 统计有有效 url 的资源数量
  const resourcesWithUrl = resources.filter(
    (resource) => resource.url && resource.url.trim() !== '',
  );

  const totalCount = resources.length;
  const urlCount = resourcesWithUrl.length;

  // 所有资源都没有 url
  if (urlCount === 0) {
    return 'not_generated';
  }

  // 部分资源有 url
  if (urlCount < totalCount) {
    return 'partial';
  }

  // 所有资源都有 url
  return 'complete';
}

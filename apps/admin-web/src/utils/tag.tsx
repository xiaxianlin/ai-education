import { Badge, type BadgeVariant } from '@/components/ui';

/**
 * 资源类型标签配置
 */
export const RESOURCE_TYPE_CONFIG = {
  image: { variant: 'secondary', text: '图片' },
  audio: { variant: 'success', text: '音频' },
  video: { variant: 'outline', text: '视频' },
} as const;

/**
 * 渲染资源类型标签
 */
export function renderResourceTypeTag(resourceType?: string) {
  if (!resourceType) {
    return <Badge variant="outline">无</Badge>;
  }

  const config = RESOURCE_TYPE_CONFIG[resourceType as keyof typeof RESOURCE_TYPE_CONFIG];
  if (config) {
    return <Badge variant={config.variant as BadgeVariant}>{config.text}</Badge>;
  }

  return <Badge variant="outline">{resourceType}</Badge>;
}

/**
 * 渲染资源生成状态标签
 */
export function renderResourceStatusTag(hasResource: boolean, resourceType?: string) {
  if (!resourceType) {
    return <Badge variant="outline">-</Badge>;
  }

  return <Badge variant={hasResource ? 'success' : 'warning'}>{hasResource ? '已生成' : '未生成'}</Badge>;
}

/**
 * 渲染布尔值标签
 */
export function renderBooleanTag(value: boolean, trueText = '是', falseText = '否') {
  return <Badge variant={value ? 'success' : 'outline'}>{value ? trueText : falseText}</Badge>;
}

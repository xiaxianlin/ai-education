import { Tag } from 'antd';

/**
 * 资源类型标签配置
 */
export const RESOURCE_TYPE_CONFIG = {
  image: { color: 'blue', text: '图片' },
  audio: { color: 'green', text: '音频' },
  video: { color: 'purple', text: '视频' },
} as const;

/**
 * 渲染资源类型标签
 */
export function renderResourceTypeTag(resourceType?: string) {
  if (!resourceType) {
    return <Tag>无</Tag>;
  }

  const config = RESOURCE_TYPE_CONFIG[resourceType as keyof typeof RESOURCE_TYPE_CONFIG];
  if (config) {
    return <Tag color={config.color}>{config.text}</Tag>;
  }

  return <Tag>{resourceType}</Tag>;
}

/**
 * 渲染资源生成状态标签
 */
export function renderResourceStatusTag(hasResource: boolean, resourceType?: string) {
  if (!resourceType) {
    return <Tag>-</Tag>;
  }

  return (
    <Tag color={hasResource ? 'success' : 'warning'}>
      {hasResource ? '已生成' : '未生成'}
    </Tag>
  );
}

/**
 * 渲染布尔值标签
 */
export function renderBooleanTag(value: boolean, trueText = '是', falseText = '否') {
  return <Tag color={value ? 'success' : 'default'}>{value ? trueText : falseText}</Tag>;
}

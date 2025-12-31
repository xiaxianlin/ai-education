import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  GRADES,
  RESOURCE_TYPE_COLORS,
  RESOURCE_TYPE_LABELS,
  STAGE_LABELS,
  Stage,
} from '@ai-education/shared-web';
import { Descriptions, Flex, Tag } from 'antd';

interface BaseDetailProps {
  item: any;
}

export function BaseDetail({ item }: BaseDetailProps) {
  return (
    <Descriptions column={3} bordered size="small">
      <Descriptions.Item label="编码">{item?.code || '-'}</Descriptions.Item>
      <Descriptions.Item label="名称">{item?.name || '-'}</Descriptions.Item>
      <Descriptions.Item label="科目">{item?.subject ? <Tag color="blue">{item.subject}</Tag> : '-'}</Descriptions.Item>
      <Descriptions.Item label="难度">
        {item?.difficulty ? (
          <Tag color={DIFFICULTY_COLORS[item.difficulty as Difficulty]}>
            {DIFFICULTY_LABELS[item.difficulty as Difficulty]}
          </Tag>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="资源类型">
        {item?.resource_type ? (
          <Tag color={RESOURCE_TYPE_COLORS[item.resource_type as ResourceType]}>
            {RESOURCE_TYPE_LABELS[item.resource_type as ResourceType]}
          </Tag>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="适用学段">
        {item?.stages?.length ? (
          <Flex gap={4} wrap>
            {item.stages.map((s: Stage) => (
              <Tag key={s} color="green">
                {STAGE_LABELS[s as keyof typeof STAGE_LABELS] || s}
              </Tag>
            ))}
          </Flex>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="适用年级">
        {item?.grades?.length ? (
          <Flex gap={4} wrap>
            {item.grades.map((g: number) => (
              <Tag key={g}>{GRADES[g] || `${g}年级`}</Tag>
            ))}
          </Flex>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="排序">{item?.sort_order ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {item?.create_time ? new Date(item.create_time * 1000).toLocaleString() : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="更新时间">
        {item?.update_time ? new Date(item.update_time * 1000).toLocaleString() : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="描述" span={2}>
        {item?.description || '-'}
      </Descriptions.Item>
    </Descriptions>
  );
}

import { GRADES, STAGE_LABELS, Stage } from '@ai-education/shared-web';
import { Descriptions, Flex, Tag } from 'antd';

interface BaseDetailProps {
  item: any;
}

export function BaseDetail({ item }: BaseDetailProps) {
  return (
    <Descriptions column={2} bordered>
      <Descriptions.Item label="编码">{item?.code || '-'}</Descriptions.Item>
      <Descriptions.Item label="名称">{item?.name || '-'}</Descriptions.Item>
      <Descriptions.Item label="科目">
        {item?.subject ? <Tag color="blue">{item.subject}</Tag> : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="状态">
        {item?.is_active !== undefined ? (
          <Tag color={item.is_active ? 'success' : 'error'}>{item.is_active ? '启用' : '禁用'}</Tag>
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


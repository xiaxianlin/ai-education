import { ABILITY_TYPE_MAP, GRADES, STAGE_LABELS, Stage } from '@ai-education/shared-web';
import { Descriptions, Flex, Tag } from 'antd';

interface BaseInfoProps {
  detail: any;
}

export function BaseInfo({ detail }: BaseInfoProps) {
  const subjectMap = detail.subject ? ABILITY_TYPE_MAP[detail.subject] : {};
  const specialtyLabel = detail.specialty_type ? subjectMap?.[detail.specialty_type] || detail.specialty_type : null;

  return (
    <Descriptions column={2} bordered>
      <Descriptions.Item label="名称">{detail.name}</Descriptions.Item>
      <Descriptions.Item label="标识">{detail.slug}</Descriptions.Item>
      <Descriptions.Item label="科目">{detail.subject || '-'}</Descriptions.Item>
      <Descriptions.Item label="专项类型">
        {specialtyLabel ? <Tag>{specialtyLabel}</Tag> : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="学段">
        {detail.stages?.length ? (
          <Flex gap={4} wrap>
            {detail.stages.map((s: Stage) => (
              <Tag key={s}>{STAGE_LABELS[s] || s}</Tag>
            ))}
          </Flex>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="年级">
        {detail.grades?.length ? (
          <Flex gap={4} wrap>
            {detail.grades.map((g: number) => (
              <Tag key={g}>{GRADES[g] || `${g}年级`}</Tag>
            ))}
          </Flex>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="图标">{detail.icon || '-'}</Descriptions.Item>
      <Descriptions.Item label="状态">
        <Tag color={detail.is_active ? 'green' : 'default'}>{detail.is_active ? '启用' : '禁用'}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {detail.create_time ? new Date(detail.create_time * 1000).toLocaleString() : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="更新时间">
        {detail.update_time ? new Date(detail.update_time * 1000).toLocaleString() : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="描述" span={2}>
        {detail.description || '-'}
      </Descriptions.Item>
    </Descriptions>
  );
}


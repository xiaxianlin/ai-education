import { Descriptions, Tag } from 'antd';

interface BaseDetailProps {
  item: any;
}

export function BaseDetail({ item }: BaseDetailProps) {
  return (
    <Descriptions column={3} bordered size="small">
      <Descriptions.Item label="编码">{item?.code || '-'}</Descriptions.Item>
      <Descriptions.Item label="名称">{item?.name || '-'}</Descriptions.Item>
      <Descriptions.Item label="科目">{item?.subject ? <Tag color="blue">{item.subject}</Tag> : '-'}</Descriptions.Item>
      <Descriptions.Item label="题型分类">
        {item?.category ? (
          <Tag color={item.category === 'ability_practice' ? 'purple' : 'cyan'}>
            {item.category === 'ability_practice' ? '能力练习' : '单元练习'}
          </Tag>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="学段">
        {item?.grade_band ? (
          <Tag color="green">
            {item.grade_band === 'Low' ? '低年级 (1-3)' : item.grade_band === 'Mid' ? '中年级 (4-6)' : '高年级 (7-12)'}
          </Tag>
        ) : (
          '-'
        )}
      </Descriptions.Item>
      <Descriptions.Item label="能力代码">
        {item?.ability_code ? <Tag color="cyan">{item.ability_code}</Tag> : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="创建时间">
        {item?.create_time ? new Date(item.create_time * 1000).toLocaleString() : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="更新时间">
        {item?.update_time ? new Date(item.update_time * 1000).toLocaleString() : '-'}
      </Descriptions.Item>
      <Descriptions.Item label="描述" span={2}>
        {item?.description || '-'}
      </Descriptions.Item>
      {/* TODO: 以下字段已删除：difficulty, resource_type, stages, grades, ability_atomic_codes, sort_order */}
    </Descriptions>
  );
}
